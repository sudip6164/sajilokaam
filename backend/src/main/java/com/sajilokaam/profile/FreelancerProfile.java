package com.sajilokaam.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sajilokaam.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "freelancer_profiles", indexes = {
        @Index(name = "idx_freelancer_profiles_status", columnList = "status")
})
public class FreelancerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    private String headline;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(name = "hourly_rate", precision = 12, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "hourly_rate_min", precision = 12, scale = 2)
    private BigDecimal hourlyRateMin;

    @Column(name = "hourly_rate_max", precision = 12, scale = 2)
    private BigDecimal hourlyRateMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability")
    private FreelancerAvailability availability;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private FreelancerExperienceLevel experienceLevel;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "location_country")
    private String locationCountry;

    @Column(name = "location_city")
    private String locationCity;

    private String timezone;

    @Column(name = "primary_skills", columnDefinition = "TEXT")
    private String primarySkills;

    @Column(name = "secondary_skills", columnDefinition = "TEXT")
    private String secondarySkills;

    @Column(columnDefinition = "TEXT")
    private String languages;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "video_intro_url")
    private String videoIntroUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_workload")
    private PreferredWorkload preferredWorkload;

    @Enumerated(EnumType.STRING)
    @Column(name = "team_role")
    private FreelancerTeamRole teamRole;

    @Column(name = "team_name")
    private String teamName;

    @Enumerated(EnumType.STRING)
    private ProfileStatus status = ProfileStatus.DRAFT;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @JsonIgnore
    private User reviewedBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getHourlyRateMin() {
        return hourlyRateMin;
    }

    public void setHourlyRateMin(BigDecimal hourlyRateMin) {
        this.hourlyRateMin = hourlyRateMin;
    }

    public BigDecimal getHourlyRateMax() {
        return hourlyRateMax;
    }

    public void setHourlyRateMax(BigDecimal hourlyRateMax) {
        this.hourlyRateMax = hourlyRateMax;
    }

    public FreelancerAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(FreelancerAvailability availability) {
        this.availability = availability;
    }

    public FreelancerExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(FreelancerExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getLocationCountry() {
        return locationCountry;
    }

    public void setLocationCountry(String locationCountry) {
        this.locationCountry = locationCountry;
    }

    public String getLocationCity() {
        return locationCity;
    }

    public void setLocationCity(String locationCity) {
        this.locationCity = locationCity;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getPrimarySkills() {
        return primarySkills;
    }

    public void setPrimarySkills(String primarySkills) {
        this.primarySkills = primarySkills;
    }

    public String getSecondarySkills() {
        return secondarySkills;
    }

    public void setSecondarySkills(String secondarySkills) {
        this.secondarySkills = secondarySkills;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getVideoIntroUrl() {
        return videoIntroUrl;
    }

    public void setVideoIntroUrl(String videoIntroUrl) {
        this.videoIntroUrl = videoIntroUrl;
    }

    public PreferredWorkload getPreferredWorkload() {
        return preferredWorkload;
    }

    public void setPreferredWorkload(PreferredWorkload preferredWorkload) {
        this.preferredWorkload = preferredWorkload;
    }

    public FreelancerTeamRole getTeamRole() {
        return teamRole;
    }

    public void setTeamRole(FreelancerTeamRole teamRole) {
        this.teamRole = teamRole;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public ProfileStatus getStatus() {
        return status;
    }

    public void setStatus(ProfileStatus status) {
        this.status = status;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

