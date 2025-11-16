package com.sajilokaam.timecategory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-categories")
@CrossOrigin(origins = "http://localhost:5173")
public class TimeCategoryController {
    private final TimeCategoryRepository timeCategoryRepository;

    public TimeCategoryController(TimeCategoryRepository timeCategoryRepository) {
        this.timeCategoryRepository = timeCategoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<TimeCategory>> getAllCategories() {
        return ResponseEntity.ok(timeCategoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeCategory> getCategoryById(@PathVariable Long id) {
        return timeCategoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

