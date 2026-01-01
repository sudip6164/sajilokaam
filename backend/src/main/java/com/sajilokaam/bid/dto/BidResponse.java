package com.sajilokaam.bid.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class BidResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long freelancerId;
    private String freelancerName;
    private String freelancerEmail;
    private BigDecimal amount;
    private String message;
    private String status;
    private Instant createdAt;

    public BidResponse() {}

    public BidResponse(Long id, Long jobId, String jobTitle, Long freelancerId, 
                      String freelancerName, String freelancerEmail, 
                      BigDecimal amount, String message, String status, Instant createdAt) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.freelancerId = freelancerId;
        this.freelancerName = freelancerName;
        this.freelancerEmail = freelancerEmail;
        this.amount = amount;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getFreelancerId() { return freelancerId; }
    public void setFreelancerId(Long freelancerId) { this.freelancerId = freelancerId; }

    public String getFreelancerName() { return freelancerName; }
    public void setFreelancerName(String freelancerName) { this.freelancerName = freelancerName; }

    public String getFreelancerEmail() { return freelancerEmail; }
    public void setFreelancerEmail(String freelancerEmail) { this.freelancerEmail = freelancerEmail; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

