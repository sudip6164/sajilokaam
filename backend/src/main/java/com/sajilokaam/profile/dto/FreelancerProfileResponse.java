package com.sajilokaam.profile.dto;

import com.sajilokaam.profile.FreelancerAvailability;
import com.sajilokaam.profile.FreelancerExperienceLevel;
import com.sajilokaam.profile.FreelancerTeamRole;
import com.sajilokaam.profile.PreferredWorkload;
import com.sajilokaam.profile.ProfileStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class FreelancerProfileResponse {
    private Long id;
    private Long userId;
    private String headline;
    private String overview;
    private BigDecimal hourlyRate;
    private BigDecimal hourlyRateMin;
    private BigDecimal hourlyRateMax;
    private FreelancerAvailability availability;
    private FreelancerExperienceLevel experienceLevel;
    private Integer experienceYears;
    private String locationCountry;
    private String locationCity;
    private String timezone;
    private String primarySkills;
    private String secondarySkills;
    private String languages;
    private String education;
    private String certifications;
    private String portfolioUrl;
    private String websiteUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String videoIntroUrl;
    private String profilePictureUrl;
    private PreferredWorkload preferredWorkload;
    private FreelancerTeamRole teamRole;
    private String teamName;
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

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
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
}



