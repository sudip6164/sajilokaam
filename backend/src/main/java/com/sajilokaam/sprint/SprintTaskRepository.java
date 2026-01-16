package com.sajilokaam.sprint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SprintTaskRepository extends JpaRepository<SprintTask, SprintTaskId> {
    List<SprintTask> findBySprintId(Long sprintId);
    
    @Query("SELECT st.task FROM SprintTask st WHERE st.sprintId = :sprintId")
    List<com.sajilokaam.task.Task> findTasksBySprintId(@Param("sprintId") Long sprintId);
    
    void deleteBySprintIdAndTaskId(Long sprintId, Long taskId);
    boolean existsBySprintIdAndTaskId(Long sprintId, Long taskId);
}
