package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.FreelancerProfileRequest;
import com.sajilokaam.profile.dto.ProfileSubmissionRequest;
import com.sajilokaam.user.User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
public class FreelancerProfileService {

    private final FreelancerProfileRepository freelancerProfileRepository;

    public FreelancerProfileService(FreelancerProfileRepository freelancerProfileRepository) {
        this.freelancerProfileRepository = freelancerProfileRepository;
    }

    public FreelancerProfile getOrCreate(User user) {
        return freelancerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    FreelancerProfile profile = new FreelancerProfile();
                    profile.setUser(user);
                    profile.setStatus(ProfileStatus.DRAFT);
                    return freelancerProfileRepository.save(profile);
                });
    }

    public FreelancerProfile updateProfile(User user, FreelancerProfileRequest request) {
        FreelancerProfile profile = getOrCreate(user);

        // Only update fields that are provided (not null)
        if (request.getHeadline() != null) {
            profile.setHeadline(request.getHeadline());
        }
        if (request.getOverview() != null) {
            profile.setOverview(request.getOverview());
        }
        if (request.getHourlyRate() != null) {
            profile.setHourlyRate(request.getHourlyRate());
        }
        if (request.getHourlyRateMin() != null) {
            profile.setHourlyRateMin(request.getHourlyRateMin());
        }
        if (request.getHourlyRateMax() != null) {
            profile.setHourlyRateMax(request.getHourlyRateMax());
        }
        if (request.getAvailability() != null) {
            profile.setAvailability(request.getAvailability());
        }
        if (request.getExperienceLevel() != null) {
            profile.setExperienceLevel(request.getExperienceLevel());
        }
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getLocationCountry() != null) {
            profile.setLocationCountry(request.getLocationCountry());
        }
        if (request.getLocationCity() != null) {
            profile.setLocationCity(request.getLocationCity());
        }
        if (request.getTimezone() != null) {
            profile.setTimezone(request.getTimezone());
        }
        if (request.getPrimarySkills() != null) {
            profile.setPrimarySkills(request.getPrimarySkills());
        }
        if (request.getSecondarySkills() != null) {
            profile.setSecondarySkills(request.getSecondarySkills());
        }
        if (request.getLanguages() != null) {
            profile.setLanguages(request.getLanguages());
        }
        if (request.getEducation() != null) {
            profile.setEducation(request.getEducation());
        }
        if (request.getCertifications() != null) {
            profile.setCertifications(request.getCertifications());
        }
        if (request.getPortfolioUrl() != null) {
            profile.setPortfolioUrl(request.getPortfolioUrl());
        }
        if (request.getWebsiteUrl() != null) {
            profile.setWebsiteUrl(request.getWebsiteUrl());
        }
        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }
        if (request.getVideoIntroUrl() != null) {
            profile.setVideoIntroUrl(request.getVideoIntroUrl());
        }
        if (request.getPreferredWorkload() != null) {
            profile.setPreferredWorkload(request.getPreferredWorkload());
        }
        if (request.getTeamRole() != null) {
            profile.setTeamRole(request.getTeamRole());
        }
        if (request.getTeamName() != null) {
            profile.setTeamName(request.getTeamName());
        }

        if (profile.getStatus() == ProfileStatus.REJECTED || profile.getStatus() == ProfileStatus.NEEDS_UPDATE) {
            profile.setStatus(ProfileStatus.DRAFT);
            profile.setRejectionReason(null);
            profile.setVerificationNotes(null);
        }

        if (isProfileComplete(profile)) {
            if (profile.getStatus() == ProfileStatus.INCOMPLETE) {
                profile.setStatus(ProfileStatus.DRAFT);
            }
        } else {
            profile.setStatus(ProfileStatus.INCOMPLETE);
        }

        return freelancerProfileRepository.save(profile);
    }

    public FreelancerProfile submitProfile(User user, ProfileSubmissionRequest request) {
        if (request == null || !request.isConfirmTerms()) {
            throw new IllegalArgumentException("Please confirm the accuracy of your profile information before submitting.");
        }

        FreelancerProfile profile = getOrCreate(user);
        if (!isProfileComplete(profile)) {
            throw new IllegalStateException("Profile is incomplete. Fill out required sections before submitting for verification.");
        }

        profile.setStatus(ProfileStatus.UNDER_REVIEW);
        profile.setSubmittedAt(Instant.now());
        profile.setReviewedAt(null);
        profile.setReviewedBy(null);
        profile.setVerificationNotes(request.getAdditionalNotes());
        profile.setRejectionReason(null);

        return freelancerProfileRepository.save(profile);
    }

    private boolean isProfileComplete(FreelancerProfile profile) {
        return StringUtils.hasText(profile.getHeadline())
                && StringUtils.hasText(profile.getOverview())
                && profile.getHourlyRate() != null
                && profile.getAvailability() != null
                && StringUtils.hasText(profile.getPrimarySkills())
                && StringUtils.hasText(profile.getLocationCountry())
                && profile.getExperienceLevel() != null;
    }
}


