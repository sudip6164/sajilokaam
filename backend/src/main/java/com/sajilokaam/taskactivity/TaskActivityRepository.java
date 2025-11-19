package com.sajilokaam.taskactivity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {
    List<TaskActivity> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    @Query(value = """
            SELECT * FROM task_activities
            WHERE task_id = :taskId
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<TaskActivity> findRecentActivities(
            @Param("taskId") Long taskId,
            @Param("offset") int offset,
            @Param("limit") int limit);
}

