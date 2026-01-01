package com.sajilokaam.file;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.file.dto.FileResponse;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
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
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public FileController(FileRepository fileRepository, TaskRepository taskRepository,
                         ProjectRepository projectRepository, UserRepository userRepository, JwtService jwtService) {
        this.fileRepository = fileRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
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

    @PostMapping("/{projectId}/files")
    public ResponseEntity<FileResponse> uploadProjectFile(
            @PathVariable Long projectId,
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

        // Verify project exists
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
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

            // Get first task in project or create a general file entry
            List<Task> projectTasks = taskRepository.findByProjectId(projectId);
            Task task = projectTasks.isEmpty() ? null : projectTasks.get(0);

            // Save file metadata
            FileEntity fileEntity = new FileEntity();
            fileEntity.setTask(task); // Can be null for project-level files
            fileEntity.setUploader(user);
            fileEntity.setFilename(originalFilename != null ? originalFilename : "file");
            fileEntity.setContentType(file.getContentType());
            fileEntity.setSizeBytes(file.getSize());
            fileEntity.setFilePath(filePath.toString());

            FileEntity saved = fileRepository.save(fileEntity);
            
            // Build file URL (absolute URL)
            String fileUrl = "http://localhost:8080/api/projects/" + projectId + "/files/" + saved.getId() + "/download";
            if (task != null) {
                fileUrl = "http://localhost:8080/api/projects/" + projectId + "/tasks/" + task.getId() + "/files/" + saved.getId() + "/download";
            }
            
            FileResponse response = new FileResponse(
                saved.getId(),
                saved.getFilename(),
                fileUrl,
                saved.getSizeBytes(),
                new FileResponse.UploadedBy(user.getId(), user.getFullName()),
                saved.getCreatedAt()
            );
            
            URI location = URI.create("/api/projects/" + projectId + "/files/" + saved.getId());
            return ResponseEntity.created(location).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{projectId}/files")
    public ResponseEntity<List<FileResponse>> getProjectFiles(
            @PathVariable Long projectId,
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

        // Get all files for all tasks in the project
        List<FileEntity> allFiles = fileRepository.findAll();
        List<FileResponse> projectFiles = allFiles.stream()
                .filter(file -> {
                    if (file.getTask() == null) {
                        // Project-level files - need to check if they belong to this project
                        // For now, we'll include files without tasks if they're in the project
                        return true; // We'll need to add project reference to FileEntity later
                    }
                    return file.getTask().getProject() != null &&
                           file.getTask().getProject().getId().equals(projectId);
                })
                .map(file -> {
                    String fileUrl = "http://localhost:8080/api/projects/" + projectId + "/files/" + file.getId() + "/download";
                    if (file.getTask() != null) {
                        fileUrl = "http://localhost:8080/api/projects/" + projectId + "/tasks/" + file.getTask().getId() + "/files/" + file.getId() + "/download";
                    }
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
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(projectFiles);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/files")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<FileResponse>> getFiles(
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
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
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

    @GetMapping("/{projectId}/files/{fileId}/download")
    public ResponseEntity<Resource> downloadProjectFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId,
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

        Optional<FileEntity> fileOpt = fileRepository.findById(fileId);
        if (fileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileEntity fileEntity = fileOpt.get();
        // Verify file belongs to project (either through task or directly)
        if (fileEntity.getTask() != null && !fileEntity.getTask().getProject().getId().equals(projectId)) {
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
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileEntity.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

