package com.sajilokaam.jobtemplate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/job-templates")
@CrossOrigin(origins = "*")
public class JobTemplateController {
    private final JobTemplateRepository templateRepository;

    public JobTemplateController(JobTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @GetMapping
    public ResponseEntity<List<JobTemplate>> getAllTemplates(
            @RequestParam(required = false) Long categoryId) {
        List<JobTemplate> templates;
        if (categoryId != null) {
            templates = templateRepository.findByCategoryId(categoryId);
        } else {
            templates = templateRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobTemplate> getTemplateById(@PathVariable Long id) {
        Optional<JobTemplate> template = templateRepository.findById(id);
        return template.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

