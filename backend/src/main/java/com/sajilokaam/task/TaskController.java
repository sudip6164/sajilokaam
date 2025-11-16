package com.sajilokaam.task;

import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
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
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, ProjectRepository projectRepository,
                          UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<Task>> listTasks(@PathVariable Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(taskRepository.findByProjectId(projectId));
    }

    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<Task> createTask(
            @PathVariable Long projectId,
            @RequestBody TaskCreateRequest request) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Task task = new Task();
        task.setProject(projectOpt.get());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");
        task.setDueDate(request.getDueDate());
        task.setMilestoneId(request.getMilestoneId());

        if (request.getAssigneeId() != null) {
            Optional<User> assigneeOpt = userRepository.findById(request.getAssigneeId());
            assigneeOpt.ifPresent(task::setAssignee);
        }

        Task created = taskRepository.save(task);
        URI location = URI.create("/api/projects/" + projectId + "/tasks/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{projectId}/tasks/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody TaskStatusUpdateRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Validate status value
        String status = request.getStatus().toUpperCase();
        if (!status.equals("TODO") && !status.equals("IN_PROGRESS") && !status.equals("DONE")) {
            return ResponseEntity.badRequest().build();
        }

        task.setStatus(status);
        Task updated = taskRepository.save(task);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{projectId}/tasks/{taskId}/assignee")
    public ResponseEntity<Task> updateTaskAssignee(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody TaskAssigneeUpdateRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getAssigneeId() != null) {
            Optional<User> assigneeOpt = userRepository.findById(request.getAssigneeId());
            if (assigneeOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            task.setAssignee(assigneeOpt.get());
        } else {
            task.setAssignee(null);
        }

        Task updated = taskRepository.save(task);
        return ResponseEntity.ok(updated);
    }
}

