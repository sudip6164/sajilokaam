package com.sajilokaam.timersession;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.timelog.TimeLog;
import com.sajilokaam.timelog.TimeLogRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/timer")
@CrossOrigin(origins = "http://localhost:5173")
public class TimerController {
    private final TimerSessionRepository timerSessionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TimeLogRepository timeLogRepository;

    public TimerController(TimerSessionRepository timerSessionRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository,
                          JwtService jwtService,
                          TimeLogRepository timeLogRepository) {
        this.timerSessionRepository = timerSessionRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.timeLogRepository = timeLogRepository;
    }

    @PostMapping("/start")
    public ResponseEntity<TimerSession> startTimer(
            @RequestBody TimerStartRequest request,
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

        // Stop any active timer for this user
        Optional<TimerSession> activeTimerOpt = timerSessionRepository.findByUserIdAndIsActiveTrue(user.getId());
        if (activeTimerOpt.isPresent()) {
            TimerSession activeTimer = activeTimerOpt.get();
            stopTimerInternal(activeTimer);
        }

        // Verify task exists
        Optional<Task> taskOpt = taskRepository.findById(request.getTaskId());
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();

        // Create new timer session
        TimerSession session = new TimerSession();
        session.setTask(task);
        session.setUser(user);
        session.setStartedAt(LocalDateTime.now());
        session.setLastActivityAt(LocalDateTime.now());
        session.setIsActive(true);
        session.setIsPaused(false);
        session.setDescription(request.getDescription());
        session.setIsBillable(request.getIsBillable() != null ? request.getIsBillable() : true);

        TimerSession created = timerSessionRepository.save(session);
        URI location = URI.create("/api/timer/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<TimerSession> pauseTimer(
            @PathVariable Long id,
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

        Optional<TimerSession> sessionOpt = timerSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TimerSession session = sessionOpt.get();
        if (!session.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (!session.getIsActive() || session.getIsPaused()) {
            return ResponseEntity.badRequest().build();
        }

        // Calculate elapsed time
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = session.getResumedAt() != null ? session.getResumedAt() : session.getStartedAt();
        long elapsedSeconds = Duration.between(startTime, now).getSeconds();
        session.setTotalSeconds(session.getTotalSeconds() + (int) elapsedSeconds);

        session.setPausedAt(now);
        session.setIsPaused(true);
        session.setUpdatedAt(java.time.Instant.now());

        TimerSession updated = timerSessionRepository.save(session);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<TimerSession> resumeTimer(
            @PathVariable Long id,
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

        Optional<TimerSession> sessionOpt = timerSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TimerSession session = sessionOpt.get();
        if (!session.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (!session.getIsActive() || !session.getIsPaused()) {
            return ResponseEntity.badRequest().build();
        }

        session.setResumedAt(LocalDateTime.now());
        session.setLastActivityAt(LocalDateTime.now());
        session.setIsPaused(false);
        session.setUpdatedAt(java.time.Instant.now());

        TimerSession updated = timerSessionRepository.save(session);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<TimeLog> stopTimer(
            @PathVariable Long id,
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

        Optional<TimerSession> sessionOpt = timerSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TimerSession session = sessionOpt.get();
        if (!session.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (!session.getIsActive()) {
            return ResponseEntity.badRequest().build();
        }

        TimeLog timeLog = stopTimerInternal(session);
        return ResponseEntity.ok(timeLog);
    }

    @GetMapping
    public ResponseEntity<com.sajilokaam.timersession.dto.TimerSessionResponse> getActiveTimer(
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

        Optional<TimerSession> sessionOpt = timerSessionRepository.findByUserIdAndIsActiveTrue(userOpt.get().getId());
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TimerSession session = sessionOpt.get();
        // Access task and project to initialize lazy loading
        Long projectId = session.getTask() != null && session.getTask().getProject() != null 
            ? session.getTask().getProject().getId() 
            : null;
        Long taskId = session.getTask() != null ? session.getTask().getId() : null;

        com.sajilokaam.timersession.dto.TimerSessionResponse response = new com.sajilokaam.timersession.dto.TimerSessionResponse(
            session.getId(),
            projectId,
            taskId,
            session.getStartedAt(),
            session.getDescription(),
            session.getIsActive(),
            session.getIsPaused(),
            session.getTotalSeconds()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<TimerSession> getActiveTimerAlt(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        return getActiveTimer(authorization);
    }

    @PostMapping("/{id}/activity")
    public ResponseEntity<TimerSession> updateActivity(
            @PathVariable Long id,
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

        Optional<TimerSession> sessionOpt = timerSessionRepository.findById(id);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TimerSession session = sessionOpt.get();
        if (!session.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        session.setLastActivityAt(LocalDateTime.now());
        session.setUpdatedAt(java.time.Instant.now());

        TimerSession updated = timerSessionRepository.save(session);
        return ResponseEntity.ok(updated);
    }

    private TimeLog stopTimerInternal(TimerSession session) {
        LocalDateTime now = LocalDateTime.now();
        
        // Calculate final elapsed time
        if (!session.getIsPaused()) {
            LocalDateTime startTime = session.getResumedAt() != null ? session.getResumedAt() : session.getStartedAt();
            long elapsedSeconds = Duration.between(startTime, now).getSeconds();
            session.setTotalSeconds(session.getTotalSeconds() + (int) elapsedSeconds);
        }

        session.setStoppedAt(now);
        session.setIsActive(false);
        session.setIsPaused(false);
        session.setUpdatedAt(java.time.Instant.now());
        timerSessionRepository.save(session);

        // Create time log entry
        int minutes = (int) Math.ceil(session.getTotalSeconds() / 60.0);
        if (minutes > 0) {
            TimeLog timeLog = new TimeLog();
            timeLog.setTask(session.getTask());
            timeLog.setUser(session.getUser());
            timeLog.setMinutes(minutes);
            timeLog.setTimerSession(session);
            timeLog.setDescription(session.getDescription());
            timeLog.setIsBillable(session.getIsBillable());
            timeLog.setStartTime(session.getStartedAt());
            timeLog.setEndTime(now);
            return timeLogRepository.save(timeLog);
        }
        return null;
    }

    public static class TimerStartRequest {
        private Long taskId;
        private String description;
        private Boolean isBillable;

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Boolean getIsBillable() { return isBillable; }
        public void setIsBillable(Boolean isBillable) { this.isBillable = isBillable; }
    }
}

