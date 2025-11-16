package com.sajilokaam.timersession;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TimerSessionRepository extends JpaRepository<TimerSession, Long> {
    Optional<TimerSession> findByUserIdAndIsActiveTrue(Long userId);
    List<TimerSession> findByUserIdOrderByStartedAtDesc(Long userId);
    List<TimerSession> findByTaskIdOrderByStartedAtDesc(Long taskId);
    List<TimerSession> findByUserIdAndIsActiveTrueOrderByStartedAtDesc(Long userId);
}

