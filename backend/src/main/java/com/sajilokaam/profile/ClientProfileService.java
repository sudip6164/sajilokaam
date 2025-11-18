package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.ClientProfileRequest;
import com.sajilokaam.profile.dto.ProfileSubmissionRequest;
import com.sajilokaam.user.User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
public class ClientProfileService {

    private final ClientProfileRepository clientProfileRepository;

    public ClientProfileService(ClientProfileRepository clientProfileRepository) {
        this.clientProfileRepository = clientProfileRepository;
    }

    public ClientProfile getOrCreate(User user) {
        return clientProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    ClientProfile profile = new ClientProfile();
                    profile.setUser(user);
                    profile.setStatus(ProfileStatus.DRAFT);
                    return clientProfileRepository.save(profile);
                });
    }

    public ClientProfile updateProfile(User user, ClientProfileRequest request) {
        ClientProfile profile = getOrCreate(user);

        profile.setCompanyName(request.getCompanyName());
        profile.setCompanyWebsite(request.getCompanyWebsite());
        profile.setCompanySize(request.getCompanySize());
        profile.setIndustry(request.getIndustry());
        profile.setDescription(request.getDescription());
        profile.setLocationCountry(request.getLocationCountry());
        profile.setLocationCity(request.getLocationCity());
        profile.setTimezone(request.getTimezone());
        profile.setHiringNeeds(request.getHiringNeeds());
        profile.setAverageBudgetMin(request.getAverageBudgetMin());
        profile.setAverageBudgetMax(request.getAverageBudgetMax());
        profile.setPreferredContractType(request.getPreferredContractType());
        profile.setLanguages(request.getLanguages());

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

        return clientProfileRepository.save(profile);
    }

    public ClientProfile submitProfile(User user, ProfileSubmissionRequest request) {
        if (request == null || !request.isConfirmTerms()) {
            throw new IllegalArgumentException("Please confirm the accuracy of your profile information before submitting.");
        }

        ClientProfile profile = getOrCreate(user);
        if (!isProfileComplete(profile)) {
            throw new IllegalStateException("Client profile is incomplete. Provide company, budget, and description before submitting.");
        }

        profile.setStatus(ProfileStatus.UNDER_REVIEW);
        profile.setSubmittedAt(Instant.now());
        profile.setReviewedAt(null);
        profile.setReviewedBy(null);
        profile.setVerificationNotes(request.getAdditionalNotes());
        profile.setRejectionReason(null);

        return clientProfileRepository.save(profile);
    }

    private boolean isProfileComplete(ClientProfile profile) {
        return StringUtils.hasText(profile.getCompanyName())
                && StringUtils.hasText(profile.getIndustry())
                && StringUtils.hasText(profile.getDescription())
                && profile.getAverageBudgetMin() != null
                && profile.getAverageBudgetMax() != null
                && StringUtils.hasText(profile.getLocationCountry());
    }
}



