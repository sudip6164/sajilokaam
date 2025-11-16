package com.sajilokaam.taskdependency;

import com.sajilokaam.task.Task;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "task_dependencies", indexes = {
        @Index(name = "idx_dependencies_task", columnList = "task_id"),
        @Index(name = "idx_dependencies_depends_on", columnList = "depends_on_task_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "unique_dependency", columnNames = {"task_id", "depends_on_task_id"})
})
public class TaskDependency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depends_on_task_id", nullable = false)
    private Task dependsOnTask;

    @Column(name = "dependency_type", length = 50)
    private String dependencyType = "BLOCKS"; // BLOCKS, BLOCKED_BY

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

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

    public Task getDependsOnTask() {
        return dependsOnTask;
    }

    public void setDependsOnTask(Task dependsOnTask) {
        this.dependsOnTask = dependsOnTask;
    }

    public String getDependencyType() {
        return dependencyType;
    }

    public void setDependencyType(String dependencyType) {
        this.dependencyType = dependencyType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

