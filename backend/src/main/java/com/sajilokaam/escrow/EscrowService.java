package com.sajilokaam.escrow;

import com.sajilokaam.milestone.Milestone;
import com.sajilokaam.milestone.MilestoneRepository;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.transaction.Transaction;
import com.sajilokaam.transaction.TransactionRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@SuppressWarnings("null")
public class EscrowService {

    private final EscrowAccountRepository accountRepository;
    private final EscrowReleaseRepository releaseRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final TransactionRepository transactionRepository;

    public EscrowService(EscrowAccountRepository accountRepository,
                         EscrowReleaseRepository releaseRepository,
                         ProjectRepository projectRepository,
                         UserRepository userRepository,
                         MilestoneRepository milestoneRepository,
                         TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.releaseRepository = releaseRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.milestoneRepository = milestoneRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public EscrowAccount createAccount(Long projectId, BigDecimal amount, Long clientId, Long freelancerId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));

        EscrowAccount account = new EscrowAccount();
        account.setProject(project);
        account.setClient(client);
        account.setFreelancer(freelancer);
        account.setTotalAmount(amount);
        account.setReleasedAmount(BigDecimal.ZERO);
        account.setRefundedAmount(BigDecimal.ZERO);
        account.setStatus("ACTIVE");
        account.setCreatedAt(Instant.now());
        account.setUpdatedAt(Instant.now());
        return accountRepository.save(account);
    }

    public List<EscrowAccount> getByProject(Long projectId) {
        return accountRepository.findAllByProject_Id(projectId);
    }

    public List<EscrowRelease> getReleases(Long accountId) {
        return releaseRepository.findByEscrowAccountId(accountId);
    }

    @Transactional
    public EscrowRelease releaseFunds(Long accountId, BigDecimal amount, String releaseType, Long releasedById, Long milestoneId, Long transactionId, String notes) {
        EscrowAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow account not found"));
        if (account.getReleasedAmount().add(amount).compareTo(account.getTotalAmount()) > 0) {
            throw new IllegalStateException("Release exceeds deposited amount");
        }

        User releasedBy = userRepository.findById(releasedById)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Milestone milestone = null;
        if (milestoneId != null) {
            milestone = milestoneRepository.findById(milestoneId)
                    .orElse(null);
        }
        Transaction transaction = null;
        if (transactionId != null) {
            transaction = transactionRepository.findById(transactionId)
                    .orElse(null);
        }

        EscrowRelease release = new EscrowRelease();
        release.setEscrowAccount(account);
        release.setAmount(amount);
        release.setReleaseType(releaseType);
        release.setMilestone(milestone);
        release.setReleasedBy(releasedBy);
        release.setTransaction(transaction);
        release.setNotes(notes);
        release.setReleasedAt(Instant.now());

        account.setReleasedAmount(account.getReleasedAmount().add(amount));
        account.setUpdatedAt(Instant.now());
        if (account.getReleasedAmount().compareTo(account.getTotalAmount()) >= 0) {
            account.setStatus("RELEASED");
        }

        releaseRepository.save(release);
        accountRepository.save(account);
        return release;
    }
}

