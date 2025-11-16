package com.sajilokaam.mldocument;

import com.sajilokaam.project.Project;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "document_processings", indexes = {
        @Index(name = "idx_doc_processing_project", columnList = "project_id"),
        @Index(name = "idx_doc_processing_status", columnList = "status")
})
public class DocumentProcessing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // PDF, PNG, JPG, etc.

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "ocr_text", columnDefinition = "TEXT")
    private String ocrText; // Extracted text from OCR

    @Column(name = "extracted_tasks_count")
    private Integer extractedTasksCount = 0;

    @Column(name = "processing_started_at")
    private Instant processingStartedAt;

    @Column(name = "processing_completed_at")
    private Instant processingCompletedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOcrText() { return ocrText; }
    public void setOcrText(String ocrText) { this.ocrText = ocrText; }
    public Integer getExtractedTasksCount() { return extractedTasksCount; }
    public void setExtractedTasksCount(Integer extractedTasksCount) { this.extractedTasksCount = extractedTasksCount; }
    public Instant getProcessingStartedAt() { return processingStartedAt; }
    public void setProcessingStartedAt(Instant processingStartedAt) { this.processingStartedAt = processingStartedAt; }
    public Instant getProcessingCompletedAt() { return processingCompletedAt; }
    public void setProcessingCompletedAt(Instant processingCompletedAt) { this.processingCompletedAt = processingCompletedAt; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

