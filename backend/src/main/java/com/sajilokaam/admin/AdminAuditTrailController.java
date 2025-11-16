package com.sajilokaam.admin;

import com.sajilokaam.audittrail.AuditTrail;
import com.sajilokaam.audittrail.AuditTrailRepository;
import com.sajilokaam.auth.RequiresAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/audit-trail")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminAuditTrailController {
    private final AuditTrailRepository auditTrailRepository;

    public AdminAuditTrailController(AuditTrailRepository auditTrailRepository) {
        this.auditTrailRepository = auditTrailRepository;
    }

    @GetMapping
    public ResponseEntity<Page<AuditTrail>> getAuditTrail(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditTrail> trail;

        if (userId != null) {
            trail = auditTrailRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else if (entityType != null && entityId != null) {
            trail = auditTrailRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable);
        } else {
            trail = auditTrailRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return ResponseEntity.ok(trail);
    }
}

