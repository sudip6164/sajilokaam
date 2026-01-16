package com.sajilokaam.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProjectId(Long projectId);
    
    @EntityGraph(attributePaths = {"reviewer", "project", "reviewee"})
    List<Review> findByRevieweeId(Long revieweeId);
    
    List<Review> findByReviewerId(Long reviewerId);
    Optional<Review> findByProjectIdAndReviewerId(Long projectId, Long reviewerId);
    long countByRevieweeId(Long revieweeId);
}
