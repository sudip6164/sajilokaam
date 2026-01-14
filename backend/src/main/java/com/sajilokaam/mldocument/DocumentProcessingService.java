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
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                originalFilename = "uploaded_file";
            }
            
            // Extract extension from original filename
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            // If no extension found, try to infer from content type
            if (extension.isEmpty() && file.getContentType() != null) {
                String ct = file.getContentType().toLowerCase();
                if (ct.contains("text/plain") || ct.contains("text")) {
                    extension = ".txt";
                } else if (ct.contains("pdf")) {
                    extension = ".pdf";
                }
            }
            
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Determine file type (check filename first, then file path, then content type)
            String contentType = file.getContentType();
            String fileType = determineFileType(contentType, originalFilename, filePath.toString());
            
            // Log for debugging
            System.out.println("=== File Upload Debug ===");
            System.out.println("Content Type: " + contentType);
            System.out.println("Original Filename: " + originalFilename);
            System.out.println("File Path: " + filePath.toString());
            System.out.println("Detected File Type: " + fileType);
            System.out.println("========================");

            // If file type is UNKNOWN, default to TXT (most common case for requirements docs)
            // MUST DO THIS BEFORE calling extractText!
            if ("UNKNOWN".equals(fileType) || fileType == null || fileType.isEmpty()) {
                System.out.println("WARNING: File type is UNKNOWN/null/empty, defaulting to TXT");
                fileType = "TXT";
            }

            // Save document processing record
            processing.setProject(project);
            processing.setUploadedBy(uploadedBy);
            processing.setOriginalFilename(originalFilename);
            processing.setFilePath(filePath.toString());
            processing.setFileType(fileType);
            processing.setFileSizeBytes(file.getSize());
            processing = documentProcessingRepository.save(processing);

            // Perform OCR/text extraction (fileType is now guaranteed to be TXT if it was UNKNOWN)
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
     * Determine file type from content type, filename, and file path
     * Priority: filename extension > file path > content type > default to TXT
     */
    private String determineFileType(String contentType, String filename, String filePath) {
        System.out.println("determineFileType called with - ContentType: [" + contentType + "], Filename: [" + filename + "], FilePath: [" + filePath + "]");
        
        // First, check filename extension (most reliable)
        if (filename != null && !filename.trim().isEmpty()) {
            String lower = filename.toLowerCase().trim();
            System.out.println("Checking filename: " + lower);
            if (lower.endsWith(".txt")) {
                System.out.println("Detected TXT from filename");
                return "TXT";
            }
            if (lower.endsWith(".pdf")) return "PDF";
            if (lower.endsWith(".doc")) return "DOC";
            if (lower.endsWith(".docx")) return "DOCX";
            if (lower.endsWith(".png")) return "PNG";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "JPG";
            if (lower.endsWith(".gif")) return "GIF";
            if (lower.endsWith(".bmp")) return "BMP";
        }

        // Second, check file path extension (fallback)
        if (filePath != null && !filePath.trim().isEmpty()) {
            String lowerPath = filePath.toLowerCase().trim();
            System.out.println("Checking file path: " + lowerPath);
            if (lowerPath.endsWith(".txt")) {
                System.out.println("Detected TXT from file path");
                return "TXT";
            }
            if (lowerPath.endsWith(".pdf")) return "PDF";
            if (lowerPath.endsWith(".doc")) return "DOC";
            if (lowerPath.endsWith(".docx")) return "DOCX";
            if (lowerPath.endsWith(".png")) return "PNG";
            if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) return "JPG";
            if (lowerPath.endsWith(".gif")) return "GIF";
            if (lowerPath.endsWith(".bmp")) return "BMP";
        }

        // Third, check content type (least reliable, can be wrong)
        if (contentType != null && !contentType.trim().isEmpty()) {
            String lowerContentType = contentType.toLowerCase().trim();
            System.out.println("Checking content type: " + lowerContentType);
            if (lowerContentType.contains("pdf")) return "PDF";
            if (lowerContentType.contains("text/plain") || lowerContentType.equals("text/plain")) {
                System.out.println("Detected TXT from content type");
                return "TXT";
            }
            if (lowerContentType.contains("text")) {
                System.out.println("Detected TXT from generic text content type");
                return "TXT";
            }
            if (lowerContentType.contains("application/msword")) return "DOC";
            if (lowerContentType.contains("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) return "DOCX";
            if (lowerContentType.contains("png")) return "PNG";
            if (lowerContentType.contains("jpeg") || lowerContentType.contains("jpg")) return "JPG";
            if (lowerContentType.contains("gif")) return "GIF";
            if (lowerContentType.contains("bmp")) return "BMP";
        }

        // Default to TXT instead of UNKNOWN (most common case for requirements docs)
        System.err.println("WARNING: Could not determine file type from ContentType: [" + contentType + "], Filename: [" + filename + "], FilePath: [" + filePath + "]. Defaulting to TXT.");
        return "TXT"; // Changed from UNKNOWN to TXT
    }
}

