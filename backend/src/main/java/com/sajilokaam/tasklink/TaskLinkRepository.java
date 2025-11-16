package com.sajilokaam.tasklink;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskLinkRepository extends JpaRepository<TaskLink, Long> {
    List<TaskLink> findByTaskId(Long taskId);
    List<TaskLink> findByLinkedTaskId(Long linkedTaskId);
}

