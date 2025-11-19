package com.sajilokaam.bid.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class BidComparisonResponse {
    private Long bidId;
    private Long freelancerId;
    private String freelancerName;
    private String freelancerEmail;
    private BigDecimal amount;
    private String message;
    private String status;
    private Instant createdAt;
    private String experienceLevel;
    private Double rating;

    public BidComparisonResponse() {
    }

    public BidComparisonResponse(Long bidId, Long freelancerId, String freelancerName, 
                                 String freelancerEmail, BigDecimal amount, String message,
                                 String status, Instant createdAt, String experienceLevel, Double rating) {
        this.bidId = bidId;
        this.freelancerId = freelancerId;
        this.freelancerName = freelancerName;
        this.freelancerEmail = freelancerEmail;
        this.amount = amount;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.experienceLevel = experienceLevel;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getBidId() {
        return bidId;
    }

    public void setBidId(Long bidId) {
        this.bidId = bidId;
    }

    public Long getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(Long freelancerId) {
        this.freelancerId = freelancerId;
    }

    public String getFreelancerName() {
        return freelancerName;
    }

    public void setFreelancerName(String freelancerName) {
        this.freelancerName = freelancerName;
    }

    public String getFreelancerEmail() {
        return freelancerEmail;
    }

    public void setFreelancerEmail(String freelancerEmail) {
        this.freelancerEmail = freelancerEmail;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}

