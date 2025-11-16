package com.sajilokaam.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionId(String transactionId);
    Optional<Transaction> findByGatewayTransactionId(String gatewayTransactionId);
    List<Transaction> findByPaymentId(Long paymentId);
    List<Transaction> findByGateway(String gateway);
    List<Transaction> findByStatus(String status);
}

