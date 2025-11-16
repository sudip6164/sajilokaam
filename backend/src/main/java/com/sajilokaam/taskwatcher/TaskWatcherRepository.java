package com.sajilokaam.taskwatcher;

import com.sajilokaam.task.Task;
import com.sajilokaam.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaskWatcherRepository extends JpaRepository<TaskWatcher, TaskWatcherId> {
    List<TaskWatcher> findByTask(Task task);
    List<TaskWatcher> findByUser(User user);
    Optional<TaskWatcher> findByTaskAndUser(Task task, User user);
    boolean existsByTaskAndUser(Task task, User user);
}

