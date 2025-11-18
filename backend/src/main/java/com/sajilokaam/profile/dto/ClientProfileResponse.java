package com.sajilokaam.profile.dto;

import com.sajilokaam.profile.ProfileStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class ClientProfileResponse {
    private Long id;
    private Long userId;
    private String companyName;
    private String companyWebsite;
    private String companySize;
    private String industry;
    private String description;
    private String locationCountry;
    private String locationCity;
    private String timezone;
    private String hiringNeeds;
    private BigDecimal averageBudgetMin;
    private BigDecimal averageBudgetMax;
    private String preferredContractType;
    private String languages;
    private ProfileStatus status;
    private String verificationNotes;
    private String rejectionReason;
    private Instant submittedAt;
    private Instant reviewedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getHiringNeeds() {
        return hiringNeeds;
    }

    public void setHiringNeeds(String hiringNeeds) {
        this.hiringNeeds = hiringNeeds;
    }

    public BigDecimal getAverageBudgetMin() {
        return averageBudgetMin;
    }

    public void setAverageBudgetMin(BigDecimal averageBudgetMin) {
        this.averageBudgetMin = averageBudgetMin;
    }

    public BigDecimal getAverageBudgetMax() {
        return averageBudgetMax;
    }

    public void setAverageBudgetMax(BigDecimal averageBudgetMax) {
        this.averageBudgetMax = averageBudgetMax;
    }

    public String getPreferredContractType() {
        return preferredContractType;
    }

    public void setPreferredContractType(String preferredContractType) {
        this.preferredContractType = preferredContractType;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
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
}



