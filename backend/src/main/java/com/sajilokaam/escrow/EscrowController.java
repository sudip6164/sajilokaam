package com.sajilokaam.escrow;

import com.sajilokaam.user.User;
import com.sajilokaam.user.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/escrow")
@CrossOrigin(origins = "http://localhost:5173")
public class EscrowController {

    private final EscrowService escrowService;
    private final EscrowAccountRepository accountRepository;
    private final UserContextService userContextService;

    public EscrowController(EscrowService escrowService,
                            EscrowAccountRepository accountRepository,
                            UserContextService userContextService) {
        this.escrowService = escrowService;
        this.accountRepository = accountRepository;
        this.userContextService = userContextService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EscrowAccount>> getEscrowForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(accountRepository.findAllByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<EscrowAccount> createEscrow(
            @RequestBody EscrowCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        EscrowAccount account = escrowService.createAccount(
                request.getProjectId(),
                request.getAmount(),
                request.getClientId(),
                request.getFreelancerId()
        );
        return ResponseEntity.ok(account);
    }

    @PostMapping("/{accountId}/release")
    public ResponseEntity<EscrowRelease> releaseFunds(
            @PathVariable Long accountId,
            @RequestBody EscrowReleaseRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        EscrowRelease release = escrowService.releaseFunds(
                accountId,
                request.getAmount(),
                request.getReleaseType(),
                userOpt.get().getId(),
                request.getMilestoneId(),
                request.getTransactionId(),
                request.getNotes()
        );
        return ResponseEntity.ok(release);
    }

    public static class EscrowCreateRequest {
        private Long projectId;
        private BigDecimal amount;
        private Long clientId;
        private Long freelancerId;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        public Long getFreelancerId() { return freelancerId; }
        public void setFreelancerId(Long freelancerId) { this.freelancerId = freelancerId; }
    }

    public static class EscrowReleaseRequest {
        private BigDecimal amount;
        private String releaseType;
        private Long milestoneId;
        private Long transactionId;
        private String notes;

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getReleaseType() { return releaseType; }
        public void setReleaseType(String releaseType) { this.releaseType = releaseType; }
        public Long getMilestoneId() { return milestoneId; }
        public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }
        public Long getTransactionId() { return transactionId; }
        public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}

