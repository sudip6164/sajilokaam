package com.sajilokaam.jobtemplate;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobTemplateRepository extends JpaRepository<JobTemplate, Long> {
    List<JobTemplate> findByCategoryId(Long categoryId);
    Optional<JobTemplate> findByName(String name);
    List<JobTemplate> findAllByOrderByCreatedAtDesc();
}

