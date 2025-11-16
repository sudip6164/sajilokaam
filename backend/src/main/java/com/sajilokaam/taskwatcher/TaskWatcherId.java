package com.sajilokaam.taskwatcher;

import com.sajilokaam.task.Task;
import com.sajilokaam.user.User;
import java.io.Serializable;
import java.util.Objects;

public class TaskWatcherId implements Serializable {
    private Long task;
    private Long user;

    public TaskWatcherId() {
    }

    public TaskWatcherId(Long task, Long user) {
        this.task = task;
        this.user = user;
    }

    public Long getTask() {
        return task;
    }

    public void setTask(Long task) {
        this.task = task;
    }

    public Long getUser() {
        return user;
    }

    public void setUser(Long user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaskWatcherId that = (TaskWatcherId) o;
        return Objects.equals(task, that.task) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(task, user);
    }
}

