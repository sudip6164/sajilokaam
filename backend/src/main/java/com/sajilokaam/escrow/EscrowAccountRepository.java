package com.sajilokaam.escrow;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EscrowAccountRepository extends JpaRepository<EscrowAccount, Long> {
    Optional<EscrowAccount> findByProjectId(Long projectId);
    List<EscrowAccount> findByProjectIdAndClientId(Long projectId, Long clientId);
    List<EscrowAccount> findByClientId(Long clientId);
    List<EscrowAccount> findByFreelancerId(Long freelancerId);
    List<EscrowAccount> findByStatus(String status);
    List<EscrowAccount> findAllByProjectId(Long projectId);
}

