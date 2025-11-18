package com.sajilokaam.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientProfileRepository extends JpaRepository<ClientProfile, Long> {
    Optional<ClientProfile> findByUserId(Long userId);
    List<ClientProfile> findByStatus(ProfileStatus status);
    boolean existsByUserId(Long userId);
}

