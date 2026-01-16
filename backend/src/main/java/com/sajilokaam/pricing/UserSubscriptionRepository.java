package com.sajilokaam.pricing;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    Optional<UserSubscription> findByUserIdAndIsActiveTrue(Long userId);
    List<UserSubscription> findByUserId(Long userId);
    List<UserSubscription> findByIsActiveTrue();
}
