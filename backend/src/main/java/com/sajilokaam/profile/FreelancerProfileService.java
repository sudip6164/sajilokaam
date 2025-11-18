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

        profile.setHeadline(request.getHeadline());
        profile.setOverview(request.getOverview());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setHourlyRateMin(request.getHourlyRateMin());
        profile.setHourlyRateMax(request.getHourlyRateMax());
        profile.setAvailability(request.getAvailability());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setLocationCountry(request.getLocationCountry());
        profile.setLocationCity(request.getLocationCity());
        profile.setTimezone(request.getTimezone());
        profile.setPrimarySkills(request.getPrimarySkills());
        profile.setSecondarySkills(request.getSecondarySkills());
        profile.setLanguages(request.getLanguages());
        profile.setEducation(request.getEducation());
        profile.setCertifications(request.getCertifications());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setWebsiteUrl(request.getWebsiteUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setVideoIntroUrl(request.getVideoIntroUrl());
        profile.setPreferredWorkload(request.getPreferredWorkload());
        profile.setTeamRole(request.getTeamRole());
        profile.setTeamName(request.getTeamName());

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


