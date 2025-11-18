package com.sajilokaam.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdOrderByCreatedAtDesc(Long invoiceId);
    List<Payment> findByStatus(String status);
    List<Payment> findTop10ByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByGateway(String gateway);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    BigDecimal sumTotalAmount();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(p.gateway, 'OFFLINE'), COUNT(p), COALESCE(SUM(p.amount), 0) FROM Payment p GROUP BY p.gateway")
    List<Object[]> aggregateByGateway();

    @Query("SELECT p.status, COUNT(p) FROM Payment p GROUP BY p.status")
    List<Object[]> aggregateStatusCounts();
}

