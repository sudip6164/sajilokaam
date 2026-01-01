package com.sajilokaam.task;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.file.FileEntity;
import com.sajilokaam.file.FileRepository;
import com.sajilokaam.file.dto.FileResponse;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskAttachmentController {

    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final FileRepository fileRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TaskAttachmentController(FileRepository fileRepository, TaskRepository taskRepository,
                                   UserRepository userRepository, JwtService jwtService) {
        this.fileRepository = fileRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        
        // Create upload directory if it doesn't exist
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            System.err.println("Failed to create upload directory: " + e.getMessage());
        }
    }

    @GetMapping("/{taskId}/attachments")
    public ResponseEntity<List<FileResponse>> getAttachments(
            @PathVariable Long taskId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // Verify task exists
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        Long projectId = task.getProject().getId();

        List<FileEntity> files = fileRepository.findByTaskId(taskId);
        List<FileResponse> responses = files.stream()
                .map(file -> {
                    String fileUrl = "http://localhost:8080/api/projects/" + projectId + "/tasks/" + taskId + "/files/" + file.getId() + "/download";
                    // Initialize lazy-loaded uploader
                    User uploader = file.getUploader();
                    return new FileResponse(
                        file.getId(),
                        file.getFilename(),
                        fileUrl,
                        file.getSizeBytes(),
                        new FileResponse.UploadedBy(uploader.getId(), uploader.getFullName()),
                        file.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{taskId}/attachments")
    public ResponseEntity<FileResponse> addAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        // Verify task exists
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        Long projectId = task.getProject().getId();

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save file metadata
            FileEntity fileEntity = new FileEntity();
            fileEntity.setTask(task);
            fileEntity.setUploader(user);
            fileEntity.setFilename(originalFilename != null ? originalFilename : "file");
            fileEntity.setContentType(file.getContentType());
            fileEntity.setSizeBytes(file.getSize());
            fileEntity.setFilePath(filePath.toString());

            FileEntity saved = fileRepository.save(fileEntity);
            
            String fileUrl = "http://localhost:8080/api/projects/" + projectId + "/tasks/" + taskId + "/files/" + saved.getId() + "/download";
            
            FileResponse response = new FileResponse(
                saved.getId(),
                saved.getFilename(),
                fileUrl,
                saved.getSizeBytes(),
                new FileResponse.UploadedBy(user.getId(), user.getFullName()),
                saved.getCreatedAt()
            );
            
            URI location = URI.create("/api/tasks/" + taskId + "/attachments/" + saved.getId());
            return ResponseEntity.created(location).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}

