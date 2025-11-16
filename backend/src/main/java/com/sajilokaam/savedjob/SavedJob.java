package com.sajilokaam.savedjob;

import com.sajilokaam.job.Job;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_jobs", indexes = {
        @Index(name = "idx_saved_jobs_user", columnList = "user_id"),
        @Index(name = "idx_saved_jobs_job", columnList = "job_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "unique_saved_job", columnNames = {"user_id", "job_id"})
})
public class SavedJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

