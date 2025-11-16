package com.sajilokaam.taskwatcher;

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
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskWatcherController {
    private final TaskWatcherRepository taskWatcherRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TaskWatcherController(TaskWatcherRepository taskWatcherRepository,
                                 TaskRepository taskRepository,
                                 UserRepository userRepository,
                                 JwtService jwtService) {
        this.taskWatcherRepository = taskWatcherRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/{taskId}/watchers")
    public ResponseEntity<List<TaskWatcher>> getTaskWatchers(@PathVariable Long taskId) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<TaskWatcher> watchers = taskWatcherRepository.findByTask(taskOpt.get());
        return ResponseEntity.ok(watchers);
    }

    @PostMapping("/{taskId}/watchers")
    public ResponseEntity<TaskWatcher> addWatcher(
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
        User user = userOpt.get();

        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();

        // Check if already watching
        if (taskWatcherRepository.existsByTaskAndUser(task, user)) {
            return ResponseEntity.badRequest().build();
        }

        TaskWatcher watcher = new TaskWatcher();
        watcher.setTask(task);
        watcher.setUser(user);

        TaskWatcher created = taskWatcherRepository.save(watcher);
        URI location = URI.create("/api/tasks/" + taskId + "/watchers");
        return ResponseEntity.created(location).body(created);
    }

    @DeleteMapping("/{taskId}/watchers")
    public ResponseEntity<Void> removeWatcher(
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
        User user = userOpt.get();

        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();

        Optional<TaskWatcher> watcherOpt = taskWatcherRepository.findByTaskAndUser(task, user);
        if (watcherOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        taskWatcherRepository.delete(watcherOpt.get());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{taskId}/watchers/check")
    public ResponseEntity<Boolean> isWatching(
            @PathVariable Long taskId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.ok(false);
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.ok(false);
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(false);
        }
        User user = userOpt.get();

        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();

        boolean isWatching = taskWatcherRepository.existsByTaskAndUser(task, user);
        return ResponseEntity.ok(isWatching);
    }
}

