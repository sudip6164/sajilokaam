package com.sajilokaam.taskactivity;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskActivityController {
    private final TaskActivityRepository taskActivityRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TaskActivityController(TaskActivityRepository taskActivityRepository,
                                  UserRepository userRepository,
                                  JwtService jwtService) {
        this.taskActivityRepository = taskActivityRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/{taskId}/activities")
    public ResponseEntity<List<TaskActivity>> getTaskActivities(
            @PathVariable Long taskId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (size > 100) {
            size = 100;
        }

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

        List<TaskActivity> activities = taskActivityRepository.findRecentActivities(taskId, page * size, size);
        return ResponseEntity.ok(activities);
    }
}

