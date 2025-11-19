package com.sajilokaam.taskdependency;

import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.taskdependency.dto.TaskDependencyResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskDependencyController {
    private final TaskDependencyRepository taskDependencyRepository;
    private final TaskRepository taskRepository;

    public TaskDependencyController(TaskDependencyRepository taskDependencyRepository,
                                   TaskRepository taskRepository) {
        this.taskDependencyRepository = taskDependencyRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/{taskId}/dependencies")
    public ResponseEntity<List<TaskDependencyResponse>> getTaskDependencies(@PathVariable Long taskId) {
        List<TaskDependencyResponse> dependencies = taskDependencyRepository.findByTaskId(taskId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dependencies);
    }

    @PostMapping("/{taskId}/dependencies")
    public ResponseEntity<TaskDependencyResponse> createDependency(
            @PathVariable Long taskId,
            @RequestBody TaskDependencyCreateRequest request) {
        if (!taskRepository.existsById(taskId) || 
            !taskRepository.existsById(request.getDependsOnTaskId())) {
            return ResponseEntity.notFound().build();
        }

        // Prevent circular dependencies
        if (taskId.equals(request.getDependsOnTaskId())) {
            return ResponseEntity.badRequest().build();
        }

        // Check if dependency already exists
        if (taskDependencyRepository.existsByTaskIdAndDependsOnTaskId(taskId, request.getDependsOnTaskId())) {
            return ResponseEntity.badRequest().build();
        }

        Task task = taskRepository.findById(taskId).orElseThrow();
        Task dependsOnTask = taskRepository.findById(request.getDependsOnTaskId()).orElseThrow();

        TaskDependency dependency = new TaskDependency();
        dependency.setTask(task);
        dependency.setDependsOnTask(dependsOnTask);
        dependency.setDependencyType(request.getDependencyType() != null ? request.getDependencyType() : "BLOCKS");

        TaskDependency created = taskDependencyRepository.save(dependency);
        URI location = URI.create("/api/tasks/" + taskId + "/dependencies/" + created.getId());
        return ResponseEntity.created(location).body(toResponse(created));
    }

    @DeleteMapping("/{taskId}/dependencies/{dependencyId}")
    public ResponseEntity<Void> deleteDependency(
            @PathVariable Long taskId,
            @PathVariable Long dependencyId) {
        return taskDependencyRepository.findById(dependencyId)
                .map(dep -> {
                    if (!dep.getTask().getId().equals(taskId)) {
                        return ResponseEntity.badRequest().<Void>build();
                    }
                    taskDependencyRepository.delete(dep);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private TaskDependencyResponse toResponse(TaskDependency dependency) {
        TaskDependencyResponse response = new TaskDependencyResponse();
        response.setId(dependency.getId());
        response.setTaskId(dependency.getTask().getId());
        response.setDependsOnTaskId(dependency.getDependsOnTask().getId());
        response.setDependsOnTaskTitle(dependency.getDependsOnTask().getTitle());
        response.setDependsOnTaskStatus(dependency.getDependsOnTask().getStatus());
        response.setDependencyType(dependency.getDependencyType());
        response.setCreatedAt(dependency.getCreatedAt());
        return response;
    }

    public static class TaskDependencyCreateRequest {
        private Long dependsOnTaskId;
        private String dependencyType;

        public Long getDependsOnTaskId() {
            return dependsOnTaskId;
        }

        public void setDependsOnTaskId(Long dependsOnTaskId) {
            this.dependsOnTaskId = dependsOnTaskId;
        }

        public String getDependencyType() {
            return dependencyType;
        }

        public void setDependencyType(String dependencyType) {
            this.dependencyType = dependencyType;
        }
    }
}

