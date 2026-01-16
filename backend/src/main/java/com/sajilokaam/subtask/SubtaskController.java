package com.sajilokaam.subtask;

import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class SubtaskController {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;

    public SubtaskController(SubtaskRepository subtaskRepository, TaskRepository taskRepository) {
        this.subtaskRepository = subtaskRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/{taskId}/subtasks")
    public ResponseEntity<List<Subtask>> getSubtasks(@PathVariable Long taskId) {
        if (taskId == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!taskRepository.existsById(taskId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subtaskRepository.findByTaskId(taskId));
    }

    @PostMapping("/{taskId}/subtasks")
    public ResponseEntity<Subtask> createSubtask(
            @PathVariable Long taskId,
            @RequestBody SubtaskCreateRequest request) {
        if (taskId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Subtask subtask = new Subtask();
        subtask.setTask(taskOpt.get());
        subtask.setTitle(request.getTitle().trim());
        subtask.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");

        Subtask created = subtaskRepository.save(subtask);
        URI location = URI.create("/api/tasks/" + taskId + "/subtasks/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{taskId}/subtasks/{subtaskId}/status")
    public ResponseEntity<Subtask> updateSubtaskStatus(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @RequestBody SubtaskStatusUpdateRequest request) {
        Optional<Subtask> subtaskOpt = subtaskRepository.findById(subtaskId);
        if (subtaskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Subtask subtask = subtaskOpt.get();
        if (!subtask.getTask().getId().equals(taskId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String status = request.getStatus().toUpperCase();
        if (!status.equals("TODO") && !status.equals("IN_PROGRESS") && !status.equals("DONE")) {
            return ResponseEntity.badRequest().build();
        }

        subtask.setStatus(status);
        Subtask updated = subtaskRepository.save(subtask);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<Subtask> updateSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @RequestBody SubtaskUpdateRequest request) {
        Optional<Subtask> subtaskOpt = subtaskRepository.findById(subtaskId);
        if (subtaskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Subtask subtask = subtaskOpt.get();
        if (!subtask.getTask().getId().equals(taskId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            subtask.setTitle(request.getTitle().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String status = request.getStatus().toUpperCase();
            if (status.equals("TODO") || status.equals("IN_PROGRESS") || status.equals("DONE")) {
                subtask.setStatus(status);
            }
        }

        Subtask updated = subtaskRepository.save(subtask);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<Void> deleteSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId) {
        Optional<Subtask> subtaskOpt = subtaskRepository.findById(subtaskId);
        if (subtaskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Subtask subtask = subtaskOpt.get();
        if (!subtask.getTask().getId().equals(taskId)) {
            return ResponseEntity.badRequest().build();
        }

        subtaskRepository.delete(subtask);
        return ResponseEntity.noContent().build();
    }
}

