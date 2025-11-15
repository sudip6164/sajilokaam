package com.sajilokaam.job;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByClientId(Long clientId);
    
    @EntityGraph(attributePaths = {"client"})
    Optional<Job> findById(Long id);
    
    @EntityGraph(attributePaths = {"client"})
    List<Job> findAll();
}

