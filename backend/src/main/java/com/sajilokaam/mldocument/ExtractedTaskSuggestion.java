package com.sajilokaam.mldocument;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "extracted_task_suggestions", indexes = {
        @Index(name = "idx_extracted_task_doc", columnList = "document_processing_id"),
        @Index(name = "idx_extracted_task_status", columnList = "status")
})
public class ExtractedTaskSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_processing_id", nullable = false)
    private DocumentProcessing documentProcessing;

    @Column(name = "suggested_title", nullable = false, length = 255)
    private String suggestedTitle;

    @Column(name = "suggested_description", columnDefinition = "TEXT")
    private String suggestedDescription;

    @Column(name = "suggested_priority", length = 50)
    private String suggestedPriority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "suggested_due_date")
    private LocalDate suggestedDueDate;

    @Column(name = "suggested_estimated_hours")
    private Integer suggestedEstimatedHours;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private java.math.BigDecimal confidenceScore; // 0.00 to 1.00

    @Column(name = "extraction_method", length = 50)
    private String extractionMethod; // OCR_PATTERN, NLP_EXTRACTION, etc.

    @Column(name = "raw_text_snippet", columnDefinition = "TEXT")
    private String rawTextSnippet; // Original text that led to this suggestion

    @Column(name = "line_number")
    private Integer lineNumber; // Line number in document where this was found

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, MODIFIED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DocumentProcessing getDocumentProcessing() { return documentProcessing; }
    public void setDocumentProcessing(DocumentProcessing documentProcessing) { this.documentProcessing = documentProcessing; }
    public String getSuggestedTitle() { return suggestedTitle; }
    public void setSuggestedTitle(String suggestedTitle) { this.suggestedTitle = suggestedTitle; }
    public String getSuggestedDescription() { return suggestedDescription; }
    public void setSuggestedDescription(String suggestedDescription) { this.suggestedDescription = suggestedDescription; }
    public String getSuggestedPriority() { return suggestedPriority; }
    public void setSuggestedPriority(String suggestedPriority) { this.suggestedPriority = suggestedPriority; }
    public LocalDate getSuggestedDueDate() { return suggestedDueDate; }
    public void setSuggestedDueDate(LocalDate suggestedDueDate) { this.suggestedDueDate = suggestedDueDate; }
    public Integer getSuggestedEstimatedHours() { return suggestedEstimatedHours; }
    public void setSuggestedEstimatedHours(Integer suggestedEstimatedHours) { this.suggestedEstimatedHours = suggestedEstimatedHours; }
    public java.math.BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(java.math.BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getExtractionMethod() { return extractionMethod; }
    public void setExtractionMethod(String extractionMethod) { this.extractionMethod = extractionMethod; }
    public String getRawTextSnippet() { return rawTextSnippet; }
    public void setRawTextSnippet(String rawTextSnippet) { this.rawTextSnippet = rawTextSnippet; }
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

