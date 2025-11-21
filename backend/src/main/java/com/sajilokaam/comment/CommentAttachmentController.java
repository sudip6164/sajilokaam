package com.sajilokaam.comment;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.comment.dto.CommentResponse;
import com.sajilokaam.task.Task;
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
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentAttachmentController {

    private static final long MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Path ATTACHMENT_ROOT = Paths.get("uploads", "comment-attachments");

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CommentAttachmentRepository commentAttachmentRepository;

    public CommentAttachmentController(CommentRepository commentRepository,
                                       UserRepository userRepository,
                                       JwtService jwtService,
                                       CommentAttachmentRepository commentAttachmentRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.commentAttachmentRepository = commentAttachmentRepository;

        try {
            if (!Files.exists(ATTACHMENT_ROOT)) {
                Files.createDirectories(ATTACHMENT_ROOT);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to initialize attachment directory", e);
        }
    }

    @PostMapping("/{projectId}/tasks/{taskId}/comments/{commentId}/attachments")
    public ResponseEntity<CommentResponse.AttachmentSummary> uploadAttachment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorization) {

        Optional<User> userOpt = resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comment comment = commentOpt.get();
        Task task = comment.getTask();
        if (!task.getId().equals(taskId) || !task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
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
            String storedName = UUID.randomUUID() + extension;
            Path destination = ATTACHMENT_ROOT.resolve(storedName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            CommentAttachment attachment = new CommentAttachment();
            attachment.setComment(comment);
            attachment.setTask(task);
            attachment.setUploader(user);
            attachment.setFilename(originalFilename != null ? originalFilename : "attachment");
            attachment.setContentType(file.getContentType());
            attachment.setSizeBytes(file.getSize());
            attachment.setFilePath(destination.toString());

            CommentAttachment saved = commentAttachmentRepository.save(attachment);

            CommentResponse.AttachmentSummary summary = toSummary(saved, projectId, taskId, commentId);
            URI location = URI.create(buildDownloadPath(projectId, taskId, commentId, saved.getId()));
            return ResponseEntity.created(location).body(summary);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{projectId}/tasks/{taskId}/comments/{commentId}/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long projectId,
                                                       @PathVariable Long taskId,
                                                       @PathVariable Long commentId,
                                                       @PathVariable Long attachmentId) {
        Optional<CommentAttachment> attachmentOpt = commentAttachmentRepository.findById(attachmentId);
        if (attachmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CommentAttachment attachment = attachmentOpt.get();
        Comment comment = attachment.getComment();
        if (!comment.getId().equals(commentId) ||
                !attachment.getTask().getId().equals(taskId) ||
                !comment.getTask().getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = attachment.getContentType() != null
                    ? attachment.getContentType()
                    : MediaType.APPLICATION_OCTET_STREAM_VALUE;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + attachment.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    public static String buildDownloadPath(Long projectId, Long taskId, Long commentId, Long attachmentId) {
        return "/api/projects/" + projectId + "/tasks/" + taskId + "/comments/" + commentId + "/attachments/" + attachmentId + "/download";
    }

    private CommentResponse.AttachmentSummary toSummary(CommentAttachment attachment,
                                                        Long projectId,
                                                        Long taskId,
                                                        Long commentId) {
        CommentResponse.AttachmentSummary summary = new CommentResponse.AttachmentSummary();
        summary.setId(attachment.getId());
        summary.setFilename(attachment.getFilename());
        summary.setContentType(attachment.getContentType());
        summary.setSizeBytes(attachment.getSizeBytes());
        summary.setDownloadUrl(buildDownloadPath(projectId, taskId, commentId, attachment.getId()));
        summary.setPreviewType(determinePreviewType(attachment.getContentType()));
        return summary;
    }

    private String determinePreviewType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "FILE";
        }
        if (contentType.startsWith("image/")) {
            return "IMAGE";
        }
        if (contentType.startsWith("video/")) {
            return "VIDEO";
        }
        if (contentType.startsWith("audio/")) {
            return "AUDIO";
        }
        return "FILE";
    }

    private Optional<User> resolveUser(String authorization) {
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
}


