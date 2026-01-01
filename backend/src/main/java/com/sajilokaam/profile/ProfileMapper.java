package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.ClientProfileResponse;
import com.sajilokaam.profile.dto.FreelancerProfileResponse;
import com.sajilokaam.profile.dto.ProfileDocumentResponse;

public final class ProfileMapper {

    private ProfileMapper() {}

    public static FreelancerProfileResponse toFreelancerResponse(FreelancerProfile profile) {
        FreelancerProfileResponse response = new FreelancerProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUser() != null ? profile.getUser().getId() : null);
        response.setHeadline(profile.getHeadline());
        response.setOverview(profile.getOverview());
        response.setHourlyRate(profile.getHourlyRate());
        response.setHourlyRateMin(profile.getHourlyRateMin());
        response.setHourlyRateMax(profile.getHourlyRateMax());
        response.setAvailability(profile.getAvailability());
        response.setExperienceLevel(profile.getExperienceLevel());
        response.setExperienceYears(profile.getExperienceYears());
        response.setLocationCountry(profile.getLocationCountry());
        response.setLocationCity(profile.getLocationCity());
        response.setTimezone(profile.getTimezone());
        response.setPrimarySkills(profile.getPrimarySkills());
        response.setSecondarySkills(profile.getSecondarySkills());
        response.setLanguages(profile.getLanguages());
        response.setEducation(profile.getEducation());
        response.setCertifications(profile.getCertifications());
        response.setPortfolioUrl(profile.getPortfolioUrl());
        response.setWebsiteUrl(profile.getWebsiteUrl());
        response.setLinkedinUrl(profile.getLinkedinUrl());
        response.setGithubUrl(profile.getGithubUrl());
        response.setVideoIntroUrl(profile.getVideoIntroUrl());
        response.setProfilePictureUrl(profile.getProfilePictureUrl());
        response.setPreferredWorkload(profile.getPreferredWorkload());
        response.setTeamRole(profile.getTeamRole());
        response.setTeamName(profile.getTeamName());
        response.setStatus(profile.getStatus());
        response.setVerificationNotes(profile.getVerificationNotes());
        response.setRejectionReason(profile.getRejectionReason());
        response.setSubmittedAt(profile.getSubmittedAt());
        response.setReviewedAt(profile.getReviewedAt());
        return response;
    }

    public static ClientProfileResponse toClientResponse(ClientProfile profile) {
        ClientProfileResponse response = new ClientProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUser() != null ? profile.getUser().getId() : null);
        response.setCompanyName(profile.getCompanyName());
        response.setCompanyWebsite(profile.getCompanyWebsite());
        response.setCompanySize(profile.getCompanySize());
        response.setIndustry(profile.getIndustry());
        response.setDescription(profile.getDescription());
        response.setLocationCountry(profile.getLocationCountry());
        response.setLocationCity(profile.getLocationCity());
        response.setTimezone(profile.getTimezone());
        response.setHiringNeeds(profile.getHiringNeeds());
        response.setAverageBudgetMin(profile.getAverageBudgetMin());
        response.setAverageBudgetMax(profile.getAverageBudgetMax());
        response.setPreferredContractType(profile.getPreferredContractType());
        response.setLanguages(profile.getLanguages());
        response.setStatus(profile.getStatus());
        response.setVerificationNotes(profile.getVerificationNotes());
        response.setRejectionReason(profile.getRejectionReason());
        response.setSubmittedAt(profile.getSubmittedAt());
        response.setReviewedAt(profile.getReviewedAt());
        return response;
    }

    public static ProfileDocumentResponse toDocumentResponse(ProfileDocument document) {
        ProfileDocumentResponse response = new ProfileDocumentResponse();
        response.setId(document.getId());
        response.setUserId(document.getUser() != null ? document.getUser().getId() : null);
        response.setProfileType(document.getProfileType());
        response.setDocumentType(document.getDocumentType());
        response.setFileName(document.getFileName());
        response.setFileUrl(document.getFileUrl());
        response.setStatus(document.getStatus());
        response.setUploadedAt(document.getCreatedAt());
        return response;
    }
}



