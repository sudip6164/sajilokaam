package com.sajilokaam.connects;

import com.sajilokaam.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "connects_transactions", indexes = {
    @Index(name = "idx_connects_transactions_user", columnList = "user_id"),
    @Index(name = "idx_connects_transactions_created", columnList = "created_at")
})
public class ConnectTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Integer amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectTransactionType type;
    
    @Column(name = "reference_id")
    private Long referenceId;
    
    @Column(name = "reference_type", length = 50)
    private String referenceType;
    
    @Column(length = 255)
    private String description;
    
    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;
    
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Integer getAmount() {
        return amount;
    }
    
    public void setAmount(Integer amount) {
        this.amount = amount;
    }
    
    public ConnectTransactionType getType() {
        return type;
    }
    
    public void setType(ConnectTransactionType type) {
        this.type = type;
    }
    
    public Long getReferenceId() {
        return referenceId;
    }
    
    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }
    
    public String getReferenceType() {
        return referenceType;
    }
    
    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getBalanceAfter() {
        return balanceAfter;
    }
    
    public void setBalanceAfter(Integer balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
}
