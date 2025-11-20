package com.sajilokaam.message;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.conversation.Conversation;
import com.sajilokaam.conversation.ConversationRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageAttachmentController {
    private static final long MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024; // 15MB
    private static final Path ATTACHMENT_DIR = Paths.get("uploads/messages");

    private final ConversationRepository conversationRepository;
    private final MessageAttachmentRepository attachmentRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public MessageAttachmentController(ConversationRepository conversationRepository,
                                       MessageAttachmentRepository attachmentRepository,
                                       JwtService jwtService,
                                       UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.attachmentRepository = attachmentRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;

        try {
            if (!Files.exists(ATTACHMENT_DIR)) {
                Files.createDirectories(ATTACHMENT_DIR);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to create attachment directory", e);
        }
    }

    @PostMapping("/{conversationId}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long conversationId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = authenticate(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User uploader = userOpt.get();

        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Conversation conversation = conversationOpt.get();
        if (!isParticipant(conversation, uploader.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (file.isEmpty() || file.getSize() > MAX_ATTACHMENT_SIZE) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storedFilename = UUID.randomUUID() + extension;
            Path storedPath = ATTACHMENT_DIR.resolve(storedFilename);

            Files.copy(file.getInputStream(), storedPath, StandardCopyOption.REPLACE_EXISTING);

            MessageAttachment attachment = new MessageAttachment();
            attachment.setConversation(conversation);
            attachment.setUploader(uploader);
            attachment.setOriginalFilename(originalFilename != null ? originalFilename : "attachment");
            attachment.setStoredFilename(storedFilename);
            attachment.setContentType(file.getContentType());
            attachment.setSizeBytes(file.getSize());
            attachment.setFilePath(storedPath.toString());

            MessageAttachment saved = attachmentRepository.save(attachment);

            AttachmentResponse response = AttachmentResponse.from(saved);
            response.setDownloadUrl(String.format("/api/conversations/%d/attachments/%d/download", conversationId, saved.getId()));

            URI location = URI.create(response.getDownloadUrl());
            return ResponseEntity.created(location).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{conversationId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long conversationId,
            @PathVariable Long attachmentId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = authenticate(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<MessageAttachment> attachmentOpt = attachmentRepository.findById(attachmentId);
        if (attachmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MessageAttachment attachment = attachmentOpt.get();
        if (!attachment.getConversation().getId().equals(conversationId)) {
            return ResponseEntity.badRequest().build();
        }

        if (!isParticipant(attachment.getConversation(), userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    private Optional<User> authenticate(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(emailOpt.get());
    }

    private boolean isParticipant(Conversation conversation, Long userId) {
        return conversation.getParticipants()
                .stream()
                .anyMatch(participant -> participant.getId().equals(userId));
    }

    public static class AttachmentResponse {
        private Long id;
        private String originalFilename;
        private String contentType;
        private Long sizeBytes;
        private String downloadUrl;

        public static AttachmentResponse from(MessageAttachment attachment) {
            AttachmentResponse response = new AttachmentResponse();
            response.setId(attachment.getId());
            response.setOriginalFilename(attachment.getOriginalFilename());
            response.setContentType(attachment.getContentType());
            response.setSizeBytes(attachment.getSizeBytes());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }

        public void setOriginalFilename(String originalFilename) {
            this.originalFilename = originalFilename;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public Long getSizeBytes() {
            return sizeBytes;
        }

        public void setSizeBytes(Long sizeBytes) {
            this.sizeBytes = sizeBytes;
        }

        public String getDownloadUrl() {
            return downloadUrl;
        }

        public void setDownloadUrl(String downloadUrl) {
            this.downloadUrl = downloadUrl;
        }
    }
}


