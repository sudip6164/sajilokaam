package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.ProfileReviewRequest;
import com.sajilokaam.profile.dto.ProfileReviewSummary;
import com.sajilokaam.user.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProfileVerificationService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;

    public ProfileVerificationService(FreelancerProfileRepository freelancerProfileRepository,
                                      ClientProfileRepository clientProfileRepository) {
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
    }

    public List<ProfileReviewSummary> getPendingProfiles() {
        List<ProfileReviewSummary> summaries = new ArrayList<>();

        summaries.addAll(freelancerProfileRepository.findByStatus(ProfileStatus.UNDER_REVIEW)
                .stream()
                .map(this::fromFreelancer)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));

        summaries.addAll(clientProfileRepository.findByStatus(ProfileStatus.UNDER_REVIEW)
                .stream()
                .map(this::fromClient)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));

        return summaries;
    }

    @SuppressWarnings("null")
    private ProfileReviewSummary fromFreelancer(FreelancerProfile profile) {
        User owner = profile.getUser();
        if (owner == null) {
            return null;
        }
        Long ownerId = owner.getId();
        if (ownerId == null) {
            return null;
        }
        long userId = ownerId;
        Long profileIdObj = profile.getId();
        if (profileIdObj == null) {
            return null;
        }
        long profileId = profileIdObj;
        ProfileReviewSummary summary = new ProfileReviewSummary();
        summary.setProfileId(profileId);
        summary.setUserId(userId);
        summary.setUserEmail(owner.getEmail());
        summary.setDisplayName(owner.getFullName());
        summary.setProfileType(ProfileType.FREELANCER);
        summary.setStatus(profile.getStatus());
        summary.setSubmittedAt(profile.getSubmittedAt());
        return summary;
    }

    @SuppressWarnings("null")
    private ProfileReviewSummary fromClient(ClientProfile profile) {
        User owner = profile.getUser();
        if (owner == null) {
            return null;
        }
        Long ownerId = owner.getId();
        if (ownerId == null) {
            return null;
        }
        long userId = ownerId;
        Long profileIdObj = profile.getId();
        if (profileIdObj == null) {
            return null;
        }
        long profileId = profileIdObj;
        ProfileReviewSummary summary = new ProfileReviewSummary();
        summary.setProfileId(profileId);
        summary.setUserId(userId);
        summary.setUserEmail(owner.getEmail());
        summary.setDisplayName(owner.getFullName());
        summary.setProfileType(ProfileType.CLIENT);
        summary.setStatus(profile.getStatus());
        summary.setSubmittedAt(profile.getSubmittedAt());
        return summary;
    }

    public FreelancerProfile reviewFreelancerProfile(long profileId, ProfileReviewRequest request, User reviewer) {
        FreelancerProfile profile = freelancerProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Freelancer profile not found"));
        profile.setStatus(request.getDecision());
        profile.setReviewedAt(Instant.now());
        profile.setReviewedBy(reviewer);
        profile.setVerificationNotes(request.getVerificationNotes());
        profile.setRejectionReason(request.getRejectionReason());
        return freelancerProfileRepository.save(profile);
    }

    public ClientProfile reviewClientProfile(long profileId, ProfileReviewRequest request, User reviewer) {
        ClientProfile profile = clientProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Client profile not found"));
        profile.setStatus(request.getDecision());
        profile.setReviewedAt(Instant.now());
        profile.setReviewedBy(reviewer);
        profile.setVerificationNotes(request.getVerificationNotes());
        profile.setRejectionReason(request.getRejectionReason());
        return clientProfileRepository.save(profile);
    }
}


