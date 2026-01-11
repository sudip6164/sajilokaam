package com.sajilokaam.jobskill;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sajilokaam.jobcategory.JobCategory;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "job_skills", indexes = {
        @Index(name = "idx_skills_category", columnList = "category_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JobSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private JobCategory category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public JobCategory getCategory() {
        return category;
    }

    public void setCategory(JobCategory category) {
        this.category = category;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

