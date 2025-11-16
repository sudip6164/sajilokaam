package com.sajilokaam.admin;

import com.sajilokaam.activitylog.ActivityLog;
import com.sajilokaam.activitylog.ActivityLogRepository;
import com.sajilokaam.auth.RequiresAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/activity-logs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminActivityLogController {
    private final ActivityLogRepository activityLogRepository;

    public AdminActivityLogController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs;

        if (userId != null) {
            logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else if (entityType != null && entityId != null) {
            logs = activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable);
        } else {
            logs = activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return ResponseEntity.ok(logs);
    }
}

