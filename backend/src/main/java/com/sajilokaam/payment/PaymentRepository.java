package com.sajilokaam.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdOrderByCreatedAtDesc(Long invoiceId);
    List<Payment> findByStatus(String status);
}

