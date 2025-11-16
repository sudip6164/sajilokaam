package com.sajilokaam.bid;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    @EntityGraph(attributePaths = {"freelancer"})
    List<Bid> findByJobId(Long jobId);
    
    @EntityGraph(attributePaths = {"job", "job.client"})
    List<Bid> findByFreelancerId(Long freelancerId);
    
    long countByJobId(Long jobId);
}

