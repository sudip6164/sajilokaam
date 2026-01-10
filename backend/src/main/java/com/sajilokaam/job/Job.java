package com.sajilokaam.job;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.sajilokaam.jobcategory.JobCategory;
import com.sajilokaam.jobskill.JobSkill;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_jobs_client", columnList = "client_id"),
        @Index(name = "idx_jobs_category", columnList = "category_id"),
        @Index(name = "idx_jobs_type", columnList = "job_type"),
        @Index(name = "idx_jobs_status", columnList = "status"),
        @Index(name = "idx_jobs_featured", columnList = "is_featured")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnore
    private User client;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private JobCategory category;

    @Column(name = "job_type", length = 50)
    private String jobType; // FIXED_PRICE, HOURLY

    @Column(name = "budget_min", precision = 12, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 12, scale = 2)
    private BigDecimal budgetMax;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel; // ENTRY, MID, SENIOR

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "job_required_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @JsonIgnore
    private Set<JobSkill> requiredSkills = new HashSet<>();

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "project_length", length = 100)
    private String projectLength; // "Less than 1 month", "1-3 months", "3-6 months", "More than 6 months"

    @OneToOne(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"job"})
    private JobDetails jobDetails;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getClient() {
        return client;
    }

    public void setClient(User client) {
        this.client = client;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public JobCategory getCategory() {
        return category;
    }

    public void setCategory(JobCategory category) {
        this.category = category;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public BigDecimal getBudgetMin() {
        return budgetMin;
    }

    public void setBudgetMin(BigDecimal budgetMin) {
        this.budgetMin = budgetMin;
    }

    public BigDecimal getBudgetMax() {
        return budgetMax;
    }

    public void setBudgetMax(BigDecimal budgetMax) {
        this.budgetMax = budgetMax;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public Set<JobSkill> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(Set<JobSkill> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getProjectLength() {
        return projectLength;
    }

    public void setProjectLength(String projectLength) {
        this.projectLength = projectLength;
    }

    public JobDetails getJobDetails() {
        return jobDetails;
    }

    public void setJobDetails(JobDetails jobDetails) {
        this.jobDetails = jobDetails;
    }

    @JsonProperty("requiredSkills")
    public List<SkillDTO> getRequiredSkillsList() {
        if (requiredSkills == null) {
            return List.of();
        }
        return requiredSkills.stream()
                .map(skill -> new SkillDTO(skill.getId(), skill.getName()))
                .collect(Collectors.toList());
    }

    // Simple DTO for skill serialization
    public static class SkillDTO {
        private Long id;
        private String name;

        public SkillDTO(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }
}

