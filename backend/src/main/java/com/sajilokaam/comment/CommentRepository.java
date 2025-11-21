package com.sajilokaam.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    Page<Comment> findByTaskId(Long taskId, Pageable pageable);

    Page<Comment> findByTaskIdAndCreatedAtBefore(Long taskId, Instant before, Pageable pageable);
}

