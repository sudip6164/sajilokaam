package com.sajilokaam.taskactivity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskActivityController {
    private final TaskActivityRepository taskActivityRepository;

    public TaskActivityController(TaskActivityRepository taskActivityRepository) {
        this.taskActivityRepository = taskActivityRepository;
    }

    @GetMapping("/{taskId}/activities")
    public ResponseEntity<List<TaskActivity>> getTaskActivities(@PathVariable Long taskId) {
        List<TaskActivity> activities = taskActivityRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/{taskId}/activities/paged")
    public ResponseEntity<Page<TaskActivity>> getTaskActivitiesPaged(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TaskActivity> activities = taskActivityRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable);
        return ResponseEntity.ok(activities);
    }
}

