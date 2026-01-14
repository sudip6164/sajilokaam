package com.sajilokaam.mldocument;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.task.Task;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/projects/{projectId}/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentProcessingController {

    private final DocumentProcessingService documentProcessingService;
    private final DocumentProcessingRepository documentProcessingRepository;
    private final ExtractedTaskSuggestionRepository extractedTaskSuggestionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public DocumentProcessingController(
            DocumentProcessingService documentProcessingService,
            DocumentProcessingRepository documentProcessingRepository,
            ExtractedTaskSuggestionRepository extractedTaskSuggestionRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            JwtService jwtService) {
        this.documentProcessingService = documentProcessingService;
        this.documentProcessingRepository = documentProcessingRepository;
        this.extractedTaskSuggestionRepository = extractedTaskSuggestionRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Upload and process a document
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        try {
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            if ("PENDING_PAYMENT".equalsIgnoreCase(projectOpt.get().getStatus())) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Project is pending payment. Please complete payment to use document processing."
                ));
            }

            CompletableFuture<DocumentProcessing> future = documentProcessingService.processDocument(
                    file, projectId, user);
            
            // Wait for completion to get suggestions count
            DocumentProcessing processing = future.get();
            
            Long processingId = processing.getId();
            
            // Get extracted task suggestions count
            List<ExtractedTaskSuggestion> suggestions = extractedTaskSuggestionRepository
                    .findByDocumentProcessingIdOrderByConfidenceScoreDesc(processingId);
            
            return ResponseEntity.ok(Map.of(
                    "id", processingId != null ? processingId : 0L,
                    "status", processing.getStatus(),
                    "message", "Document processing completed",
                    "tasks", suggestions.stream().map(s -> Map.of(
                            "id", s.getId(),
                            "title", s.getSuggestedTitle() != null ? s.getSuggestedTitle() : "",
                            "description", s.getSuggestedDescription() != null ? s.getSuggestedDescription() : "",
                            "priority", s.getSuggestedPriority() != null ? s.getSuggestedPriority() : "MEDIUM"
                    )).collect(java.util.stream.Collectors.toList())
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Failed to process document"
            ));
        }
    }

    /**
     * Get processing status
     */
    @GetMapping("/{processingId}/status")
    public ResponseEntity<DocumentProcessing> getProcessingStatus(
            @PathVariable Long projectId,
            @PathVariable Long processingId) {
        
        Optional<DocumentProcessing> processingOpt = documentProcessingRepository.findById(processingId);
        if (processingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DocumentProcessing processing = processingOpt.get();
        if (!processing.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(processing);
    }

    /**
     * Get extracted task suggestions
     */
    @GetMapping("/{processingId}/suggestions")
    public ResponseEntity<List<ExtractedTaskSuggestion>> getSuggestions(
            @PathVariable Long projectId,
            @PathVariable Long processingId) {
        
        Optional<DocumentProcessing> processingOpt = documentProcessingRepository.findById(processingId);
        if (processingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DocumentProcessing processing = processingOpt.get();
        if (!processing.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        List<ExtractedTaskSuggestion> suggestions = extractedTaskSuggestionRepository
                .findByDocumentProcessingIdOrderByConfidenceScoreDesc(processingId);
        
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Create tasks from approved suggestions
     */
    @PostMapping("/{processingId}/create-tasks")
    public ResponseEntity<Map<String, Object>> createTasks(
            @PathVariable Long projectId,
            @PathVariable Long processingId,
            @RequestBody CreateTasksRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        try {
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            if ("PENDING_PAYMENT".equalsIgnoreCase(projectOpt.get().getStatus())) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Project is pending payment. Please complete payment to create tasks."
                ));
            }
            Long procId = processingId;
            List<Task> createdTasks = documentProcessingService.createTasksFromSuggestions(
                    procId, request.getSuggestionIds());

            return ResponseEntity.ok(Map.of(
                    "message", "Tasks created successfully",
                    "count", createdTasks.size(),
                    "tasks", createdTasks
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Reject suggestions
     */
    @PostMapping("/{processingId}/reject-suggestions")
    public ResponseEntity<Map<String, String>> rejectSuggestions(
            @PathVariable Long projectId,
            @PathVariable Long processingId,
            @RequestBody RejectSuggestionsRequest request) {
        
        try {
            documentProcessingService.rejectSuggestions(processingId, request.getSuggestionIds());
            return ResponseEntity.ok(Map.of("message", "Suggestions rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all document processings for a project
     */
    @GetMapping
    public ResponseEntity<List<DocumentProcessing>> getDocumentProcessings(
            @PathVariable Long projectId) {
        
        List<DocumentProcessing> processings = documentProcessingRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId);
        
        return ResponseEntity.ok(processings);
    }

    public static class CreateTasksRequest {
        private List<Long> suggestionIds;

        public List<Long> getSuggestionIds() { return suggestionIds; }
        public void setSuggestionIds(List<Long> suggestionIds) { this.suggestionIds = suggestionIds; }
    }

    public static class RejectSuggestionsRequest {
        private List<Long> suggestionIds;

        public List<Long> getSuggestionIds() { return suggestionIds; }
        public void setSuggestionIds(List<Long> suggestionIds) { this.suggestionIds = suggestionIds; }
    }
}

