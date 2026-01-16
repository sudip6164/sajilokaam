package com.sajilokaam.pricing;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // FREE, PROFESSIONAL, ENTERPRISE

    @Column(nullable = false, length = 255)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal monthlyPrice;

    @Column(nullable = false)
    private BigDecimal yearlyPrice;

    @Column(nullable = false)
    private Integer maxBidsPerMonth; // -1 for unlimited

    @Column(nullable = false)
    private Integer maxJobPostsPerMonth; // -1 for unlimited

    @Column(nullable = false)
    private BigDecimal platformFeePercent; // e.g., 10.0 for 10%

    @Column(nullable = false)
    private Boolean featuredProfile = false;

    @Column(nullable = false)
    private Boolean prioritySupport = false;

    @Column(nullable = false)
    private Boolean active = true;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public BigDecimal getYearlyPrice() { return yearlyPrice; }
    public void setYearlyPrice(BigDecimal yearlyPrice) { this.yearlyPrice = yearlyPrice; }

    public Integer getMaxBidsPerMonth() { return maxBidsPerMonth; }
    public void setMaxBidsPerMonth(Integer maxBidsPerMonth) { this.maxBidsPerMonth = maxBidsPerMonth; }

    public Integer getMaxJobPostsPerMonth() { return maxJobPostsPerMonth; }
    public void setMaxJobPostsPerMonth(Integer maxJobPostsPerMonth) { this.maxJobPostsPerMonth = maxJobPostsPerMonth; }

    public BigDecimal getPlatformFeePercent() { return platformFeePercent; }
    public void setPlatformFeePercent(BigDecimal platformFeePercent) { this.platformFeePercent = platformFeePercent; }

    public Boolean getFeaturedProfile() { return featuredProfile; }
    public void setFeaturedProfile(Boolean featuredProfile) { this.featuredProfile = featuredProfile; }

    public Boolean getPrioritySupport() { return prioritySupport; }
    public void setPrioritySupport(Boolean prioritySupport) { this.prioritySupport = prioritySupport; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
