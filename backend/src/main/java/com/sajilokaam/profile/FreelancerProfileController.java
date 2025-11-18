package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.*;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile/freelancer")
@CrossOrigin(origins = "http://localhost:5173")
public class FreelancerProfileController {

    private final UserContextService userContextService;
    private final FreelancerProfileService freelancerProfileService;
    private final ProfileDocumentService profileDocumentService;

    public FreelancerProfileController(UserContextService userContextService,
                                       FreelancerProfileService freelancerProfileService,
                                       ProfileDocumentService profileDocumentService) {
        this.userContextService = userContextService;
        this.freelancerProfileService = freelancerProfileService;
        this.profileDocumentService = profileDocumentService;
    }

    @GetMapping("/me")
    public ResponseEntity<FreelancerProfileResponse> getMyProfile(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        FreelancerProfile profile = freelancerProfileService.getOrCreate(userOpt.get());
        return ResponseEntity.ok(ProfileMapper.toFreelancerResponse(profile));
    }

    @PutMapping
    public ResponseEntity<FreelancerProfileResponse> updateProfile(
            @RequestBody FreelancerProfileRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        FreelancerProfile profile = freelancerProfileService.updateProfile(userOpt.get(), request);
        return ResponseEntity.ok(ProfileMapper.toFreelancerResponse(profile));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitProfile(
            @RequestBody ProfileSubmissionRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        try {
            FreelancerProfile profile = freelancerProfileService.submitProfile(userOpt.get(), request);
            return ResponseEntity.ok(ProfileMapper.toFreelancerResponse(profile));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/documents")
    public ResponseEntity<List<ProfileDocumentResponse>> listDocuments(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        List<ProfileDocumentResponse> documents = profileDocumentService
                .getDocuments(userOpt.get(), ProfileType.FREELANCER)
                .stream()
                .map(ProfileMapper::toDocumentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @PostMapping("/documents")
    public ResponseEntity<ProfileDocumentResponse> uploadDocument(
            @RequestBody ProfileDocumentRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        request.setProfileType(ProfileType.FREELANCER);
        ProfileDocument document = profileDocumentService.addDocument(userOpt.get(), request);
        return ResponseEntity.ok(ProfileMapper.toDocumentResponse(document));
    }
}


