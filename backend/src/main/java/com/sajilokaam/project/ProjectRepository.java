package com.sajilokaam.project;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByJobId(Long jobId);
    
    @EntityGraph(attributePaths = {"job", "job.client"})
    Optional<Project> findById(Long id);
}

