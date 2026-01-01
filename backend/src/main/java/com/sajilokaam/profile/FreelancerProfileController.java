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
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile/freelancer")
@CrossOrigin(origins = "http://localhost:5173")
public class FreelancerProfileController {

    private final UserContextService userContextService;
    private final FreelancerProfileService freelancerProfileService;
    private final ProfileDocumentService profileDocumentService;
    private final FreelancerProfileRepository freelancerProfileRepository;

    public FreelancerProfileController(UserContextService userContextService,
                                       FreelancerProfileService freelancerProfileService,
                                       ProfileDocumentService profileDocumentService,
                                       FreelancerProfileRepository freelancerProfileRepository) {
        this.userContextService = userContextService;
        this.freelancerProfileService = freelancerProfileService;
        this.profileDocumentService = profileDocumentService;
        this.freelancerProfileRepository = freelancerProfileRepository;
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

    @PostMapping("/picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        System.out.println("========================================");
        System.out.println("PROFILE PICTURE UPLOAD REQUEST");
        System.out.println("Authorization: " + (authorization != null ? "Present" : "Missing"));
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("File type: " + file.getContentType());
        System.out.println("Is empty: " + file.isEmpty());
        System.out.println("========================================");
        
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            System.err.println("ERROR: User not found or unauthorized");
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        System.out.println("User authenticated: " + userOpt.get().getEmail());

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
        if (file.getSize() > 5 * 1024 * 1024) {
            System.err.println("ERROR: File too large: " + file.getSize());
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB"));
        }

        try {
            // Create upload directory if it doesn't exist - use absolute path
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "profile-pictures");
            System.out.println("Upload directory: " + uploadDir.toAbsolutePath());
            
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("Created upload directory");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);
            System.out.println("Saving to: " + filePath.toAbsolutePath());

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File copied successfully");
            
            // Verify file was saved
            if (!Files.exists(filePath)) {
                System.err.println("ERROR: File was not saved to disk");
                return ResponseEntity.status(500).body(Map.of("error", "File was not saved"));
            }
            
            long fileSize = Files.size(filePath);
            System.out.println("File saved, size: " + fileSize + " bytes");

            // Update profile with picture URL
            FreelancerProfile profile = freelancerProfileService.getOrCreate(userOpt.get());
            String pictureUrl = "http://localhost:8080/api/profile/freelancer/picture/" + uniqueFilename;
            profile.setProfilePictureUrl(pictureUrl);
            freelancerProfileRepository.save(profile);
            System.out.println("Profile updated with picture URL: " + pictureUrl);

            System.out.println("========================================");
            System.out.println("UPLOAD SUCCESS");
            System.out.println("========================================");
            
            return ResponseEntity.ok(Map.of(
                    "url", pictureUrl,
                    "message", "Profile picture uploaded successfully"
            ));
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("UPLOAD ERROR");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload picture: " + e.getMessage()));
        }
    }

    @GetMapping("/picture/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfilePicture(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(System.getProperty("user.dir"), "uploads", "profile-pictures", filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
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
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}


