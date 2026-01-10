package com.sajilokaam.connects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConnectTransactionRepository extends JpaRepository<ConnectTransaction, Long> {
    List<ConnectTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
