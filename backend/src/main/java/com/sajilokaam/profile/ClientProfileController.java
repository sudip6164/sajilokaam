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
@RequestMapping("/api/profile/client")
@CrossOrigin(origins = "http://localhost:5173")
public class ClientProfileController {

    private final UserContextService userContextService;
    private final ClientProfileService clientProfileService;
    private final ProfileDocumentService profileDocumentService;

    public ClientProfileController(UserContextService userContextService,
                                   ClientProfileService clientProfileService,
                                   ProfileDocumentService profileDocumentService) {
        this.userContextService = userContextService;
        this.clientProfileService = clientProfileService;
        this.profileDocumentService = profileDocumentService;
    }

    @GetMapping("/me")
    public ResponseEntity<ClientProfileResponse> getMyProfile(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        ClientProfile profile = clientProfileService.getOrCreate(userOpt.get());
        return ResponseEntity.ok(ProfileMapper.toClientResponse(profile));
    }

    @PutMapping
    public ResponseEntity<ClientProfileResponse> updateProfile(
            @RequestBody ClientProfileRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        ClientProfile profile = clientProfileService.updateProfile(userOpt.get(), request);
        return ResponseEntity.ok(ProfileMapper.toClientResponse(profile));
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
            ClientProfile profile = clientProfileService.submitProfile(userOpt.get(), request);
            return ResponseEntity.ok(ProfileMapper.toClientResponse(profile));
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
                .getDocuments(userOpt.get(), ProfileType.CLIENT)
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
        request.setProfileType(ProfileType.CLIENT);
        ProfileDocument document = profileDocumentService.addDocument(userOpt.get(), request);
        return ResponseEntity.ok(ProfileMapper.toDocumentResponse(document));
    }
}


