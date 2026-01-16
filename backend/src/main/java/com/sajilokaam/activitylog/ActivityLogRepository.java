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
    
    @Query("SELECT al FROM ActivityLog al WHERE " +
           "(al.entityType = 'FILE' AND (al.entityId IN (SELECT f.id FROM FileEntity f WHERE f.task.project.id = :projectId) OR al.description LIKE CONCAT('%project:', :projectId, '%'))) " +
           "OR (al.entityType = 'TASK' AND al.entityId IN (SELECT t.id FROM Task t WHERE t.project.id = :projectId)) " +
           "OR (al.entityType = 'MILESTONE' AND al.entityId IN (SELECT m.id FROM Milestone m WHERE m.project.id = :projectId)) " +
           "ORDER BY al.createdAt DESC")
    List<ActivityLog> findProjectActivities(@Param("projectId") Long projectId);
}

