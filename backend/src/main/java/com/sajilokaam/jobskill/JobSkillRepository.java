package com.sajilokaam.jobskill;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    Optional<JobSkill> findByName(String name);
    Optional<JobSkill> findByNameIgnoreCase(String name);
    List<JobSkill> findByCategoryId(Long categoryId);
}

