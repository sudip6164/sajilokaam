package com.sajilokaam.paymentdispute;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentDisputeRepository extends JpaRepository<PaymentDispute, Long> {
    List<PaymentDispute> findByPaymentId(Long paymentId);
    List<PaymentDispute> findByStatus(String status);
    List<PaymentDispute> findByRaisedById(Long userId);
    long countByStatus(String status);
    List<PaymentDispute> findTop5ByOrderByCreatedAtDesc();
}

