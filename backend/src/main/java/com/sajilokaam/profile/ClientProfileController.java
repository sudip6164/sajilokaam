package com.sajilokaam.profile;

import com.sajilokaam.profile.dto.*;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile/client")
@CrossOrigin(origins = "http://localhost:5173")
public class ClientProfileController {

    private final UserContextService userContextService;
    private final ClientProfileService clientProfileService;
    private final ProfileDocumentService profileDocumentService;
    private final ClientProfileRepository clientProfileRepository;

    public ClientProfileController(UserContextService userContextService,
                                   ClientProfileService clientProfileService,
                                   ProfileDocumentService profileDocumentService,
                                   ClientProfileRepository clientProfileRepository) {
        this.userContextService = userContextService;
        this.clientProfileService = clientProfileService;
        this.profileDocumentService = profileDocumentService;
        this.clientProfileRepository = clientProfileRepository;
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<ClientProfileResponse> getProfileByUserId(@PathVariable Long userId) {
        Optional<ClientProfile> profileOpt = clientProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ProfileMapper.toClientResponse(profileOpt.get()));
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

    @PostMapping("/picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        System.out.println("========================================");
        System.out.println("CLIENT PROFILE PICTURE UPLOAD STARTED");
        System.out.println("========================================");

        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            System.err.println("ERROR: User not authenticated");
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        User user = userOpt.get();
        System.out.println("User ID: " + user.getId());
        System.out.println("User Email: " + user.getEmail());

        // Validate file
        if (file.isEmpty()) {
            System.err.println("ERROR: File is empty");
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Validate image type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            System.err.println("ERROR: Invalid file type: " + contentType);
            return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
        }

        // Validate file size (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            System.err.println("ERROR: File size exceeds limit: " + file.getSize());
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
        }

        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Content type: " + contentType);

        try {
            // Create uploads directory if it doesn't exist
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "profile-pictures");
            System.out.println("Upload directory: " + uploadDir.toAbsolutePath());

            if (!Files.exists(uploadDir)) {
                System.out.println("Creating upload directory...");
                Files.createDirectories(uploadDir);
                System.out.println("Upload directory created successfully");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = user.getId() + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID() + extension;
            System.out.println("Generated filename: " + uniqueFilename);

            // Save file
            Path filePath = uploadDir.resolve(uniqueFilename);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());
            Files.write(filePath, file.getBytes());
            System.out.println("File saved successfully");

            // Update profile with picture URL
            ClientProfile profile = clientProfileService.getOrCreate(user);
            String pictureUrl = "http://localhost:8080/api/profile/client/picture/" + uniqueFilename;
            profile.setProfilePictureUrl(pictureUrl);
            clientProfileRepository.save(profile);
            System.out.println("Profile updated with picture URL: " + pictureUrl);

            System.out.println("========================================");
            System.out.println("CLIENT PROFILE PICTURE UPLOAD COMPLETED");
            System.out.println("========================================");

            return ResponseEntity.ok(Map.of(
                    "url", pictureUrl,
                    "message", "Profile picture uploaded successfully"
            ));

        } catch (IOException e) {
            System.err.println("========================================");
            System.err.println("ERROR: Failed to upload file");
            System.err.println("Exception: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/picture/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfilePicture(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", "profile-pictures", filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type from file extension
            String contentType = "image/jpeg";
            if (filename.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (filename.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            } else if (filename.toLowerCase().endsWith(".webp")) {
                contentType = "image/webp";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}


