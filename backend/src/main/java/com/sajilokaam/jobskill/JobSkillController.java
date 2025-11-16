package com.sajilokaam.jobskill;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-skills")
@CrossOrigin(origins = "http://localhost:5173")
public class JobSkillController {
    private final JobSkillRepository skillRepository;

    public JobSkillController(JobSkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @GetMapping
    public ResponseEntity<List<JobSkill>> getAllSkills(
            @RequestParam(required = false) Long categoryId) {
        List<JobSkill> skills;
        if (categoryId != null) {
            skills = skillRepository.findByCategoryId(categoryId);
        } else {
            skills = skillRepository.findAll();
        }
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobSkill> getSkillById(@PathVariable Long id) {
        return skillRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

