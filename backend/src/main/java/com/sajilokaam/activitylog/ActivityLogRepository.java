package com.sajilokaam.activitylog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    Page<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId, Pageable pageable);
    
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT al FROM ActivityLog al WHERE al.action = :action ORDER BY al.createdAt DESC")
    List<ActivityLog> findByAction(@Param("action") String action);
}

