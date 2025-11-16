package com.sajilokaam.timelog;

import com.sajilokaam.task.Task;
import com.sajilokaam.timecategory.TimeCategory;
import com.sajilokaam.timersession.TimerSession;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_logs", indexes = {
        @Index(name = "idx_timelog_session", columnList = "timer_session_id"),
        @Index(name = "idx_timelog_category", columnList = "category_id"),
        @Index(name = "idx_timelog_billable", columnList = "is_billable"),
        @Index(name = "idx_timelog_logged", columnList = "logged_at")
})
public class TimeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer minutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timer_session_id")
    private TimerSession timerSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private TimeCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_billable")
    private Boolean isBillable = true;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "logged_at", nullable = false, updatable = false)
    private Instant loggedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getMinutes() {
        return minutes;
    }

    public void setMinutes(Integer minutes) {
        this.minutes = minutes;
    }

    public Instant getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(Instant loggedAt) {
        this.loggedAt = loggedAt;
    }

    public TimerSession getTimerSession() { return timerSession; }
    public void setTimerSession(TimerSession timerSession) { this.timerSession = timerSession; }
    public TimeCategory getCategory() { return category; }
    public void setCategory(TimeCategory category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsBillable() { return isBillable; }
    public void setIsBillable(Boolean isBillable) { this.isBillable = isBillable; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}

