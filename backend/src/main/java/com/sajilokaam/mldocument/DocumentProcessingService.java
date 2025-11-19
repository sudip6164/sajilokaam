package com.sajilokaam.mldocument;

import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.task.TaskPriority;
import com.sajilokaam.user.User;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class DocumentProcessingService {

    private static final String UPLOAD_DIR = "uploads/documents";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final DocumentProcessingRepository documentProcessingRepository;
    private final ExtractedTaskSuggestionRepository extractedTaskSuggestionRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final OcrService ocrService;
    private final TaskExtractionService taskExtractionService;
    private final MlTaskExtractionClient mlTaskExtractionClient;

    public DocumentProcessingService(
            DocumentProcessingRepository documentProcessingRepository,
            ExtractedTaskSuggestionRepository extractedTaskSuggestionRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            OcrService ocrService,
            TaskExtractionService taskExtractionService,
            MlTaskExtractionClient mlTaskExtractionClient) {
        this.documentProcessingRepository = documentProcessingRepository;
        this.extractedTaskSuggestionRepository = extractedTaskSuggestionRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.ocrService = ocrService;
        this.taskExtractionService = taskExtractionService;
        this.mlTaskExtractionClient = mlTaskExtractionClient;

        // Create upload directory
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            System.err.println("Failed to create upload directory: " + e.getMessage());
        }
    }

    /**
     * Upload and process a document asynchronously
     */
    @Async
    public CompletableFuture<DocumentProcessing> processDocument(
            MultipartFile file, Long projectId, User uploadedBy) {
        
        DocumentProcessing processing = new DocumentProcessing();
        processing.setStatus("PROCESSING");
        processing.setProcessingStartedAt(Instant.now());

        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("File size exceeds maximum allowed size");
            }

            // Get project
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new IllegalArgumentException("Project not found"));

            // Save file
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Determine file type
            String contentType = file.getContentType();
            String fileType = determineFileType(contentType, originalFilename);

            // Save document processing record
            processing.setProject(project);
            processing.setUploadedBy(uploadedBy);
            processing.setOriginalFilename(originalFilename);
            processing.setFilePath(filePath.toString());
            processing.setFileType(fileType);
            processing.setFileSizeBytes(file.getSize());
            processing = documentProcessingRepository.save(processing);

            // Perform OCR
            String ocrText = ocrService.extractText(filePath, fileType);
            processing.setOcrText(ocrText);
            documentProcessingRepository.save(processing);

            // Extract tasks using Python ML service (with fallback to rule-based)
            Long processingId = processing.getId();
            List<ExtractedTaskSuggestion> suggestions;
            
            // Try Python ML service first
            if (mlTaskExtractionClient.isServiceAvailable()) {
                try {
                    suggestions = mlTaskExtractionClient.extractTasksFromMlService(ocrText, processingId);
                    if (suggestions.isEmpty()) {
                        // Fallback to rule-based if ML returns nothing
                        suggestions = taskExtractionService.extractTasks(ocrText, processingId);
                    }
                } catch (Exception e) {
                    System.err.println("ML service error, falling back to rule-based: " + e.getMessage());
                    // Fallback to rule-based extraction
                    suggestions = taskExtractionService.extractTasks(ocrText, processingId);
                }
            } else {
                // ML service not available, use rule-based extraction
                System.out.println("ML service not available, using rule-based extraction");
                suggestions = taskExtractionService.extractTasks(ocrText, processingId);
            }

            // Save suggestions
            DocumentProcessing finalProcessing = processing;
            for (ExtractedTaskSuggestion suggestion : suggestions) {
                suggestion.setDocumentProcessing(finalProcessing);
                extractedTaskSuggestionRepository.save(suggestion);
            }

            // Update processing status
            processing.setStatus("COMPLETED");
            processing.setExtractedTasksCount(suggestions.size());
            processing.setProcessingCompletedAt(Instant.now());
            processing = documentProcessingRepository.save(processing);

            return CompletableFuture.completedFuture(processing);

        } catch (Exception e) {
            processing.setStatus("FAILED");
            processing.setErrorMessage(e.getMessage());
            processing.setProcessingCompletedAt(Instant.now());
            documentProcessingRepository.save(processing);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Create tasks from approved suggestions
     */
    @Transactional
    public List<Task> createTasksFromSuggestions(Long documentProcessingId, List<Long> suggestionIds) {
        DocumentProcessing processing = documentProcessingRepository.findById(documentProcessingId)
                .orElseThrow(() -> new IllegalArgumentException("Document processing not found"));

        List<Task> createdTasks = new java.util.ArrayList<>();
        
        for (Long suggestionId : suggestionIds) {
            ExtractedTaskSuggestion suggestion = extractedTaskSuggestionRepository.findById(suggestionId)
                    .orElseThrow(() -> new IllegalArgumentException("Suggestion not found: " + suggestionId));

            Long suggestionDocId = suggestion.getDocumentProcessing().getId();
            if (suggestionDocId == null || !suggestionDocId.equals(documentProcessingId)) {
                continue; // Skip if suggestion doesn't belong to this document
            }

            // Create task
            Task task = new Task();
            task.setProject(processing.getProject());
            task.setTitle(suggestion.getSuggestedTitle());
            task.setDescription(suggestion.getSuggestedDescription());
            task.setPriority(resolvePriority(suggestion.getSuggestedPriority()));
            task.setDueDate(suggestion.getSuggestedDueDate());
            task.setEstimatedHours(suggestion.getSuggestedEstimatedHours());
            task.setStatus("TODO"); // Default status

            task = taskRepository.save(task);
            createdTasks.add(task);

            // Update suggestion status
            suggestion.setStatus("APPROVED");
            extractedTaskSuggestionRepository.save(suggestion);
        }

        return createdTasks;
    }

    /**
     * Reject suggestions
     */
    @Transactional
    public void rejectSuggestions(Long documentProcessingId, List<Long> suggestionIds) {
        for (Long suggestionId : suggestionIds) {
            ExtractedTaskSuggestion suggestion = extractedTaskSuggestionRepository.findById(suggestionId)
                    .orElseThrow(() -> new IllegalArgumentException("Suggestion not found: " + suggestionId));

            if (suggestion.getDocumentProcessing().getId().equals(documentProcessingId)) {
                suggestion.setStatus("REJECTED");
                extractedTaskSuggestionRepository.save(suggestion);
            }
        }
    }

    private TaskPriority resolvePriority(String suggestedPriority) {
        if (suggestedPriority == null || suggestedPriority.isBlank()) {
            return TaskPriority.MEDIUM;
        }
        try {
            return TaskPriority.valueOf(suggestedPriority.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return TaskPriority.MEDIUM;
        }
    }

    /**
     * Determine file type from content type and filename
     */
    private String determineFileType(String contentType, String filename) {
        if (contentType != null) {
            if (contentType.contains("pdf")) return "PDF";
            if (contentType.contains("png")) return "PNG";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) return "JPG";
            if (contentType.contains("gif")) return "GIF";
            if (contentType.contains("bmp")) return "BMP";
        }

        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".pdf")) return "PDF";
            if (lower.endsWith(".png")) return "PNG";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "JPG";
            if (lower.endsWith(".gif")) return "GIF";
            if (lower.endsWith(".bmp")) return "BMP";
        }

        return "UNKNOWN";
    }
}

