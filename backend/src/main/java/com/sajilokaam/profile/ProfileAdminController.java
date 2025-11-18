package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.ClientProfileResponse;
import com.sajilokaam.profile.dto.FreelancerProfileResponse;
import com.sajilokaam.profile.dto.ProfileDocumentResponse;
import com.sajilokaam.profile.dto.ProfileReviewRequest;
import com.sajilokaam.profile.dto.ProfileReviewSummary;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileAdminController {

    private final UserContextService userContextService;
    private final ProfileVerificationService profileVerificationService;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final ProfileDocumentService profileDocumentService;

    public ProfileAdminController(UserContextService userContextService,
                                  ProfileVerificationService profileVerificationService,
                                  FreelancerProfileRepository freelancerProfileRepository,
                                  ClientProfileRepository clientProfileRepository,
                                  ProfileDocumentService profileDocumentService) {
        this.userContextService = userContextService;
        this.profileVerificationService = profileVerificationService;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
        this.profileDocumentService = profileDocumentService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ProfileReviewSummary>> getPending(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> adminOpt = userContextService.resolveUser(authorization);
        if (adminOpt.isEmpty() || !userHasRole(adminOpt.get(), "ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(profileVerificationService.getPendingProfiles());
    }

    @GetMapping("/freelancer/{id}")
    public ResponseEntity<FreelancerProfileResponse> getFreelancerProfile(
            @PathVariable long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> adminOpt = userContextService.resolveUser(authorization);
        if (adminOpt.isEmpty() || !userHasRole(adminOpt.get(), "ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return freelancerProfileRepository.findById(id)
                .map(ProfileMapper::toFreelancerResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/freelancer/{id}/documents")
    public ResponseEntity<List<ProfileDocumentResponse>> getFreelancerDocuments(
            @PathVariable long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> adminOpt = userContextService.resolveUser(authorization);
        if (adminOpt.isEmpty() || !userHasRole(adminOpt.get(), "ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return freelancerProfileRepository.findById(id)
                .map(FreelancerProfile::getUser)
                .map(user -> buildDocumentResponse(user.getId(), ProfileType.FREELANCER))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{id}")
    public ResponseEntity<ClientProfileResponse> getClientProfile(
            @PathVariable long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> adminOpt = userContextService.resolveUser(authorization);
        if (adminOpt.isEmpty() || !userHasRole(adminOpt.get(), "ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return clientProfileRepository.findById(id)
                .map(ProfileMapper::toClientResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{id}/documents")
    public ResponseEntity<List<ProfileDocumentResponse>> getClientDocuments(
            @PathVariable long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> adminOpt = userContextService.resolveUser(authorization);
        if (adminOpt.isEmpty() || !userHasRole(adminOpt.get(), "ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return clientProfileRepository.findById(id)
                .map(ClientProfile::getUser)
                .map(user -> buildDocumentResponse(user.getId(), ProfileType.CLIENT))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{profileId}/review")
    public ResponseEntity<?> reviewProfile(
            @PathVariable long profileId,
            @RequestBody ProfileReviewRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> adminOpt = userContextService.resolveUser(authorization);
        if (adminOpt.isEmpty() || !userHasRole(adminOpt.get(), "ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        if (request.getDecision() == null || request.getProfileType() == null) {
            return ResponseEntity.badRequest().body("Profile type and decision are required.");
        }

        if (!isAllowedDecision(request)) {
            return ResponseEntity.badRequest().body("Decision must be APPROVED, REJECTED, or NEEDS_UPDATE");
        }

        if (request.getProfileType() == ProfileType.FREELANCER) {
            FreelancerProfile profile = profileVerificationService.reviewFreelancerProfile(profileId, request, adminOpt.get());
            return ResponseEntity.ok(ProfileMapper.toFreelancerResponse(profile));
        } else {
            ClientProfile profile = profileVerificationService.reviewClientProfile(profileId, request, adminOpt.get());
            return ResponseEntity.ok(ProfileMapper.toClientResponse(profile));
        }
    }

    private boolean userHasRole(User user, String roleName) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equalsIgnoreCase(roleName));
    }

    private boolean isAllowedDecision(ProfileReviewRequest request) {
        return request.getDecision() == ProfileStatus.APPROVED
                || request.getDecision() == ProfileStatus.REJECTED
                || request.getDecision() == ProfileStatus.NEEDS_UPDATE;
    }

    private ResponseEntity<List<ProfileDocumentResponse>> buildDocumentResponse(Long userId, ProfileType profileType) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<ProfileDocumentResponse> documents = profileDocumentService
                .getDocuments(userId, profileType)
                .stream()
                .map(ProfileMapper::toDocumentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }
}


