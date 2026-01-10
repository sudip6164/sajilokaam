package com.sajilokaam.bid;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sajilokaam.job.Job;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bids", indexes = {
        @Index(name = "idx_bids_job", columnList = "job_id")
})
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "roles"})
    private User freelancer;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Upwork-style bidding features
    @Column(name = "connects_used")
    private Integer connectsUsed = 2;

    @Column(name = "is_boosted")
    private Boolean isBoosted = false;

    @Column(name = "boost_amount", precision = 10, scale = 2)
    private BigDecimal boostAmount = BigDecimal.ZERO;

    @Column(name = "available_start_date")
    private LocalDate availableStartDate;

    @Column(name = "estimated_duration", length = 100)
    private String estimatedDuration;

    @Column(name = "cover_letter_template_id")
    private Long coverLetterTemplateId;

    @Column(name = "screening_answers", columnDefinition = "TEXT")
    private String screeningAnswers;

    @Column(name = "shortlisted")
    private Boolean shortlisted = false;

    @Column(name = "viewed_by_client")
    private Boolean viewedByClient = false;

    @Column(name = "viewed_at")
    private Instant viewedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public User getFreelancer() {
        return freelancer;
    }

    public void setFreelancer(User freelancer) {
        this.freelancer = freelancer;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // Upwork-style getters and setters
    public Integer getConnectsUsed() {
        return connectsUsed;
    }

    public void setConnectsUsed(Integer connectsUsed) {
        this.connectsUsed = connectsUsed;
    }

    public Boolean getIsBoosted() {
        return isBoosted;
    }

    public void setIsBoosted(Boolean isBoosted) {
        this.isBoosted = isBoosted;
    }

    public BigDecimal getBoostAmount() {
        return boostAmount;
    }

    public void setBoostAmount(BigDecimal boostAmount) {
        this.boostAmount = boostAmount;
    }

    public LocalDate getAvailableStartDate() {
        return availableStartDate;
    }

    public void setAvailableStartDate(LocalDate availableStartDate) {
        this.availableStartDate = availableStartDate;
    }

    public String getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(String estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public Long getCoverLetterTemplateId() {
        return coverLetterTemplateId;
    }

    public void setCoverLetterTemplateId(Long coverLetterTemplateId) {
        this.coverLetterTemplateId = coverLetterTemplateId;
    }

    public String getScreeningAnswers() {
        return screeningAnswers;
    }

    public void setScreeningAnswers(String screeningAnswers) {
        this.screeningAnswers = screeningAnswers;
    }

    public Boolean getShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(Boolean shortlisted) {
        this.shortlisted = shortlisted;
    }

    public Boolean getViewedByClient() {
        return viewedByClient;
    }

    public void setViewedByClient(Boolean viewedByClient) {
        this.viewedByClient = viewedByClient;
    }

    public Instant getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(Instant viewedAt) {
        this.viewedAt = viewedAt;
    }
}

