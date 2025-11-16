package com.sajilokaam.escrow;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EscrowReleaseRepository extends JpaRepository<EscrowRelease, Long> {
    List<EscrowRelease> findByEscrowAccountId(Long escrowAccountId);
}

