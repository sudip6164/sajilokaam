package com.sajilokaam.sprint;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects/{projectId}/sprints")
@CrossOrigin(origins = "http://localhost:5173")
public class SprintController {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SprintTaskRepository sprintTaskRepository;

    public SprintController(
            SprintRepository sprintRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            JwtService jwtService,
            SprintTaskRepository sprintTaskRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.sprintTaskRepository = sprintTaskRepository;
    }

    @GetMapping
    public ResponseEntity<List<Sprint>> getSprints(@PathVariable Long projectId) {
        List<Sprint> sprints = sprintRepository.findByProjectIdOrderByStartDateDesc(projectId);
        return ResponseEntity.ok(sprints);
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(
            @PathVariable Long projectId,
            @RequestBody SprintCreateRequest request,
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

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Sprint sprint = new Sprint();
        sprint.setProject(projectOpt.get());
        sprint.setName(request.getName());
        sprint.setDescription(request.getDescription());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setGoal(request.getGoal());
        sprint.setStatus(request.getStatus() != null ? request.getStatus() : "PLANNED");
        sprint.setCreatedBy(userOpt.get());

        Sprint created = sprintRepository.save(sprint);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{sprintId}")
    public ResponseEntity<Sprint> updateSprint(
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @RequestBody SprintUpdateRequest request) {
        
        if (sprintId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Sprint> sprintOpt = sprintRepository.findById(sprintId);
        if (sprintOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Sprint sprint = sprintOpt.get();
        if (!sprint.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getName() != null) sprint.setName(request.getName());
        if (request.getDescription() != null) sprint.setDescription(request.getDescription());
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getGoal() != null) sprint.setGoal(request.getGoal());
        if (request.getStatus() != null) sprint.setStatus(request.getStatus());

        Sprint updated = sprintRepository.save(sprint);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{sprintId}/tasks")
    public ResponseEntity<Map<String, String>> addTaskToSprint(
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @RequestBody AddTaskRequest request) {
        
        if (sprintId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Sprint> sprintOpt = sprintRepository.findById(sprintId);
        if (sprintOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Sprint sprint = sprintOpt.get();
        if (!sprint.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        Long taskId = request.getTaskId();
        if (taskId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (sprintTaskRepository.existsBySprintIdAndTaskId(sprintId, taskId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Task already in sprint"));
        }

        SprintTask sprintTask = new SprintTask();
        sprintTask.setSprintId(sprintId);
        sprintTask.setTaskId(taskId);
        sprintTaskRepository.save(sprintTask);
        
        return ResponseEntity.ok(Map.of("message", "Task added to sprint"));
    }
    
    @DeleteMapping("/{sprintId}/tasks/{taskId}")
    public ResponseEntity<Void> removeTaskFromSprint(
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId) {
        
        sprintTaskRepository.deleteBySprintIdAndTaskId(sprintId, taskId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sprintId}/tasks")
    public ResponseEntity<List<Task>> getSprintTasks(
            @PathVariable Long projectId,
            @PathVariable Long sprintId) {
        
        if (sprintId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Sprint> sprintOpt = sprintRepository.findById(sprintId);
        if (sprintOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Sprint sprint = sprintOpt.get();
        if (!sprint.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        List<Task> tasks = sprintTaskRepository.findTasksBySprintId(sprintId);
        return ResponseEntity.ok(tasks);
    }
    
    @PostMapping("/{sprintId}/tasks/{taskId}")
    public ResponseEntity<Map<String, String>> addTaskToSprint(
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @PathVariable Long taskId) {
        
        Optional<Sprint> sprintOpt = sprintRepository.findById(sprintId);
        if (sprintOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        Sprint sprint = sprintOpt.get();
        if (!sprint.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (sprintTaskRepository.existsBySprintIdAndTaskId(sprintId, taskId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Task already in sprint"));
        }

        SprintTask sprintTask = new SprintTask();
        sprintTask.setSprintId(sprintId);
        sprintTask.setTaskId(taskId);
        sprintTaskRepository.save(sprintTask);
        
        return ResponseEntity.ok(Map.of("message", "Task added to sprint"));
    }

    public static class SprintCreateRequest {
        private String name;
        private String description;
        private java.time.LocalDate startDate;
        private java.time.LocalDate endDate;
        private String goal;
        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public java.time.LocalDate getStartDate() { return startDate; }
        public void setStartDate(java.time.LocalDate startDate) { this.startDate = startDate; }
        public java.time.LocalDate getEndDate() { return endDate; }
        public void setEndDate(java.time.LocalDate endDate) { this.endDate = endDate; }
        public String getGoal() { return goal; }
        public void setGoal(String goal) { this.goal = goal; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class SprintUpdateRequest {
        private String name;
        private String description;
        private java.time.LocalDate startDate;
        private java.time.LocalDate endDate;
        private String goal;
        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public java.time.LocalDate getStartDate() { return startDate; }
        public void setStartDate(java.time.LocalDate startDate) { this.startDate = startDate; }
        public java.time.LocalDate getEndDate() { return endDate; }
        public void setEndDate(java.time.LocalDate endDate) { this.endDate = endDate; }
        public String getGoal() { return goal; }
        public void setGoal(String goal) { this.goal = goal; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AddTaskRequest {
        private Long taskId;

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
    }
}

