package com.sajilokaam.taskactivity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {
        List<TaskActivity> findByTaskIdOrderByCreatedAtDesc(Long taskId);

        org.springframework.data.domain.Page<TaskActivity> findByTaskId(Long taskId,
                        org.springframework.data.domain.Pageable pageable);
}
