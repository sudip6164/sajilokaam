package com.sajilokaam.task;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @EntityGraph(attributePaths = { "assignee", "labels" })
    List<Task> findByProjectId(Long projectId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Task t WHERE t.id = :id")
    void deleteByIdDirect(@Param("id") Long id);

    boolean existsByIdAndProject_Id(Long id, Long projectId);
    
    // Explicitly declare existsById to help IDE (inherited from CrudRepository)
    @Override
    boolean existsById(Long id);
}
