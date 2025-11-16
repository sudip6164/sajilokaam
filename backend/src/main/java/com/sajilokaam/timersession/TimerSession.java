package com.sajilokaam.timersession;

import com.sajilokaam.task.Task;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "timer_sessions", indexes = {
        @Index(name = "idx_timer_sessions_user", columnList = "user_id"),
        @Index(name = "idx_timer_sessions_task", columnList = "task_id"),
        @Index(name = "idx_timer_sessions_active", columnList = "is_active"),
        @Index(name = "idx_timer_sessions_started", columnList = "started_at")
})
public class TimerSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    @Column(name = "resumed_at")
    private LocalDateTime resumedAt;

    @Column(name = "stopped_at")
    private LocalDateTime stoppedAt;

    @Column(name = "total_seconds")
    private Integer totalSeconds = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_paused")
    private Boolean isPaused = false;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "idle_seconds")
    private Integer idleSeconds = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_billable")
    private Boolean isBillable = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getPausedAt() { return pausedAt; }
    public void setPausedAt(LocalDateTime pausedAt) { this.pausedAt = pausedAt; }
    public LocalDateTime getResumedAt() { return resumedAt; }
    public void setResumedAt(LocalDateTime resumedAt) { this.resumedAt = resumedAt; }
    public LocalDateTime getStoppedAt() { return stoppedAt; }
    public void setStoppedAt(LocalDateTime stoppedAt) { this.stoppedAt = stoppedAt; }
    public Integer getTotalSeconds() { return totalSeconds; }
    public void setTotalSeconds(Integer totalSeconds) { this.totalSeconds = totalSeconds; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Boolean getIsPaused() { return isPaused; }
    public void setIsPaused(Boolean isPaused) { this.isPaused = isPaused; }
    public LocalDateTime getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(LocalDateTime lastActivityAt) { this.lastActivityAt = lastActivityAt; }
    public Integer getIdleSeconds() { return idleSeconds; }
    public void setIdleSeconds(Integer idleSeconds) { this.idleSeconds = idleSeconds; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsBillable() { return isBillable; }
    public void setIsBillable(Boolean isBillable) { this.isBillable = isBillable; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

