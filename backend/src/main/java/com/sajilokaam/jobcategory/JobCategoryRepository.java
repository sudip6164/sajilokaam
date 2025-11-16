package com.sajilokaam.jobcategory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {
    Optional<JobCategory> findByName(String name);
}

