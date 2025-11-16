package com.sajilokaam.tasklabel;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaskLabelRepository extends JpaRepository<TaskLabel, Long> {
    Optional<TaskLabel> findByName(String name);
}

