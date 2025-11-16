package com.sajilokaam.comment;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public CommentController(CommentRepository commentRepository, TaskRepository taskRepository,
                            UserRepository userRepository, JwtService jwtService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<Comment> createComment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody CommentCreateRequest request,
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

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Create comment
        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(request.getContent().trim());

        Comment created = commentRepository.save(comment);
        URI location = URI.create("/api/projects/" + projectId + "/tasks/" + taskId + "/comments/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<List<Comment>> getComments(
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

        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        return ResponseEntity.ok(comments);
    }
}

