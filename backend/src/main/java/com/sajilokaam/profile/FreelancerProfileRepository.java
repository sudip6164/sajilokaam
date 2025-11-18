package com.sajilokaam.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {
    Optional<FreelancerProfile> findByUserId(Long userId);
    List<FreelancerProfile> findByStatus(ProfileStatus status);
    boolean existsByUserId(Long userId);
}

