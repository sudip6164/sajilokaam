package com.sajilokaam.taskwatcher;

import com.sajilokaam.task.Task;
import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "task_watchers", indexes = {
        @Index(name = "idx_watchers_task", columnList = "task_id"),
        @Index(name = "idx_watchers_user", columnList = "user_id")
})
@IdClass(TaskWatcherId.class)
public class TaskWatcher {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

