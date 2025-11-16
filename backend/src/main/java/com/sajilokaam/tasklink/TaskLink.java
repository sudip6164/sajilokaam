package com.sajilokaam.tasklink;

import com.sajilokaam.task.Task;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "task_links", indexes = {
        @Index(name = "idx_links_task", columnList = "task_id"),
        @Index(name = "idx_links_linked", columnList = "linked_task_id")
})
public class TaskLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_task_id", nullable = false)
    private Task linkedTask;

    @Column(name = "link_type", nullable = false, length = 50)
    private String linkType; // RELATES_TO, DUPLICATES, CLONES

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

    public Task getLinkedTask() {
        return linkedTask;
    }

    public void setLinkedTask(Task linkedTask) {
        this.linkedTask = linkedTask;
    }

    public String getLinkType() {
        return linkType;
    }

    public void setLinkType(String linkType) {
        this.linkType = linkType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

