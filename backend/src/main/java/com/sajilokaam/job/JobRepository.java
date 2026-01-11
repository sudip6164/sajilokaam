package com.sajilokaam.job;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    List<Job> findByClient_Id(Long clientId);
    
    @EntityGraph(attributePaths = {"client", "category", "requiredSkills"})
    Optional<Job> findById(Long id);
    
    @EntityGraph(attributePaths = {"client", "category", "requiredSkills"})
    List<Job> findAll();
}

