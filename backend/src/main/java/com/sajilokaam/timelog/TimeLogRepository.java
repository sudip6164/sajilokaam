package com.sajilokaam.timelog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByTaskId(Long taskId);
    List<TimeLog> findByUserId(Long userId);
    List<TimeLog> findByTaskIdAndUserId(Long taskId, Long userId);
}

