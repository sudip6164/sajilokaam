package com.sajilokaam.tasktemplate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/task-templates")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskTemplateController {
    private final TaskTemplateRepository taskTemplateRepository;

    public TaskTemplateController(TaskTemplateRepository taskTemplateRepository) {
        this.taskTemplateRepository = taskTemplateRepository;
    }

    @GetMapping
    public ResponseEntity<List<TaskTemplate>> getAllTemplates() {
        return ResponseEntity.ok(taskTemplateRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTemplate> getTemplateById(@PathVariable Long id) {
        return taskTemplateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaskTemplate> createTemplate(@RequestBody TaskTemplate template) {
        if (template.getName() == null || template.getName().isBlank() ||
            template.getTitle() == null || template.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TaskTemplate created = taskTemplateRepository.save(template);
        URI location = URI.create("/api/task-templates/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }
}

