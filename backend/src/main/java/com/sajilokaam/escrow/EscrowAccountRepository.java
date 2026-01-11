package com.sajilokaam.escrow;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EscrowAccountRepository extends JpaRepository<EscrowAccount, Long> {
    Optional<EscrowAccount> findByProject_Id(Long projectId);
    List<EscrowAccount> findByProject_IdAndClient_Id(Long projectId, Long clientId);
    List<EscrowAccount> findByClient_Id(Long clientId);
    List<EscrowAccount> findByFreelancer_Id(Long freelancerId);
    List<EscrowAccount> findByStatus(String status);
    List<EscrowAccount> findAllByProject_Id(Long projectId);
}

