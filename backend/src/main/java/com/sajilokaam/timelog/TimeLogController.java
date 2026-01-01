package com.sajilokaam.timelog;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class TimeLogController {

    private final TimeLogRepository timeLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TimeLogController(TimeLogRepository timeLogRepository, TaskRepository taskRepository,
                            UserRepository userRepository, JwtService jwtService) {
        this.timeLogRepository = timeLogRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/{projectId}/tasks/{taskId}/time-logs")
    public ResponseEntity<TimeLog> createTimeLog(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody TimeLogCreateRequest request,
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

        // Create time log
        TimeLog timeLog = new TimeLog();
        timeLog.setTask(task);
        timeLog.setUser(user);
        timeLog.setMinutes(request.getMinutes());

        TimeLog created = timeLogRepository.save(timeLog);
        URI location = URI.create("/api/projects/" + projectId + "/tasks/" + taskId + "/time-logs/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/time-logs")
    public ResponseEntity<List<TimeLog>> getTimeLogs(
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

        List<TimeLog> timeLogs = timeLogRepository.findByTaskId(taskId);
        return ResponseEntity.ok(timeLogs);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/time-logs/summary")
    public ResponseEntity<Map<String, Object>> getTimeLogSummary(
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

        List<TimeLog> timeLogs = timeLogRepository.findByTaskId(taskId);
        int totalMinutes = timeLogs.stream()
                .mapToInt(TimeLog::getMinutes)
                .sum();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalMinutes", totalMinutes);
        summary.put("totalHours", totalMinutes / 60.0);
        summary.put("count", timeLogs.size());
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{projectId}/time-logs")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<TimeLog>> getProjectTimeLogs(
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

        // Get all tasks for this project and then get all time logs for those tasks
        List<Task> projectTasks = taskRepository.findByProjectId(projectId);
        List<TimeLog> allTimeLogs = projectTasks.stream()
                .flatMap(task -> {
                    // Initialize task project to avoid lazy loading issues
                    if (task.getProject() != null) {
                        task.getProject().getId();
                    }
                    return timeLogRepository.findByTaskId(task.getId()).stream();
                })
                .toList();
        
        return ResponseEntity.ok(allTimeLogs);
    }
}

