package com.sajilokaam.audittrail;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {
    Page<AuditTrail> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    Page<AuditTrail> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId, Pageable pageable);
    
    Page<AuditTrail> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT at FROM AuditTrail at WHERE at.action = :action ORDER BY at.createdAt DESC")
    List<AuditTrail> findByAction(@Param("action") String action);
}

