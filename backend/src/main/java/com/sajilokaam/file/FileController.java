package com.sajilokaam.file;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
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

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final FileRepository fileRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public FileController(FileRepository fileRepository, TaskRepository taskRepository,
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

    @PostMapping("/{projectId}/tasks/{taskId}/files")
    public ResponseEntity<FileEntity> uploadFile(
            @PathVariable Long projectId,
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

        // Verify task exists and belongs to project
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

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
            URI location = URI.create("/api/projects/" + projectId + "/tasks/" + taskId + "/files/" + saved.getId());
            return ResponseEntity.created(location).body(saved);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{projectId}/files")
    public ResponseEntity<List<FileEntity>> getProjectFiles(@PathVariable Long projectId) {
        // Get all files for all tasks in the project
        List<FileEntity> allFiles = fileRepository.findAll();
        List<FileEntity> projectFiles = allFiles.stream()
                .filter(file -> file.getTask() != null && 
                               file.getTask().getProject() != null &&
                               file.getTask().getProject().getId().equals(projectId))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(projectFiles);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/files")
    public ResponseEntity<List<FileEntity>> getFiles(
            @PathVariable Long projectId,
            @PathVariable Long taskId) {
        
        // Verify task exists and belongs to project
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        List<FileEntity> files = fileRepository.findByTaskId(taskId);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/files/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long fileId) {
        
        // Verify task exists and belongs to project
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        Optional<FileEntity> fileOpt = fileRepository.findById(fileId);
        if (fileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileEntity fileEntity = fileOpt.get();
        if (!fileEntity.getTask().getId().equals(taskId)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path filePath = Paths.get(fileEntity.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileEntity.getContentType() != null ? fileEntity.getContentType() : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

