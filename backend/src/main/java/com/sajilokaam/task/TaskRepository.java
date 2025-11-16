package com.sajilokaam.task;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @EntityGraph(attributePaths = {"assignee", "labels"})
    List<Task> findByProjectId(Long projectId);
    
    @EntityGraph(attributePaths = {"assignee", "labels"})
    Optional<Task> findById(Long id);
}

