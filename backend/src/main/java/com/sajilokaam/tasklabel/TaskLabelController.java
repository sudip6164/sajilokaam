package com.sajilokaam.tasklabel;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

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
        TaskLabel created = taskLabelRepository.save(label);
        URI location = URI.create("/api/task-labels/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }
}

