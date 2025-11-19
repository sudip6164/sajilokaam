package com.sajilokaam.tasklabel;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/task-labels")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskLabelController {
    private final TaskLabelRepository taskLabelRepository;

    public TaskLabelController(TaskLabelRepository taskLabelRepository) {
        this.taskLabelRepository = taskLabelRepository;
    }

    @GetMapping
    public ResponseEntity<List<TaskLabel>> getAllLabels() {
        return ResponseEntity.ok(taskLabelRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskLabel> getLabelById(@PathVariable Long id) {
        return taskLabelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaskLabel> createLabel(@RequestBody TaskLabel label) {
        if (label.getName() == null || label.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (label.getColor() == null || label.getColor().isBlank()) {
            label.setColor("#6366f1");
        }
        TaskLabel created = taskLabelRepository.save(label);
        URI location = URI.create("/api/task-labels/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskLabel> updateLabel(
            @PathVariable Long id,
            @RequestBody TaskLabel label) {
        if (label.getName() == null || label.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<TaskLabel> existingOpt = taskLabelRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TaskLabel existing = existingOpt.get();
        existing.setName(label.getName());
        existing.setColor(label.getColor() != null && !label.getColor().isBlank()
                ? label.getColor()
                : existing.getColor());

        TaskLabel updated = taskLabelRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabel(@PathVariable Long id) {
        if (!taskLabelRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskLabelRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

