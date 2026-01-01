package com.sajilokaam.timersession.dto;

import com.sajilokaam.timersession.TimerSession;
import java.time.LocalDateTime;

public class TimerSessionResponse {
    private Long id;
    private Long projectId;
    private Long taskId;
    private String startTime;
    private String description;
    private Boolean isActive;
    private Boolean isPaused;
    private Integer totalSeconds;

    public TimerSessionResponse() {}

    public TimerSessionResponse(Long id, Long projectId, Long taskId, LocalDateTime startTime, String description, Boolean isActive, Boolean isPaused, Integer totalSeconds) {
        this.id = id;
        this.projectId = projectId;
        this.taskId = taskId;
        this.startTime = startTime != null ? startTime.toString() : null;
        this.description = description;
        this.isActive = isActive;
        this.isPaused = isPaused;
        this.totalSeconds = totalSeconds;
    }

    public TimerSessionResponse(TimerSession session) {
        this.id = session.getId();
        this.taskId = session.getTask() != null ? session.getTask().getId() : null;
        this.projectId = session.getTask() != null && session.getTask().getProject() != null 
            ? session.getTask().getProject().getId() : null;
        this.startTime = session.getStartedAt() != null ? session.getStartedAt().toString() : null;
        this.description = session.getDescription();
        this.isActive = session.getIsActive();
        this.isPaused = session.getIsPaused();
        this.totalSeconds = session.getTotalSeconds();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Boolean getIsPaused() { return isPaused; }
    public void setIsPaused(Boolean isPaused) { this.isPaused = isPaused; }
    public Integer getTotalSeconds() { return totalSeconds; }
    public void setTotalSeconds(Integer totalSeconds) { this.totalSeconds = totalSeconds; }
}

