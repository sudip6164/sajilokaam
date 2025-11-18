package com.sajilokaam.profile.dto;

import java.math.BigDecimal;

public class ClientProfileRequest {
    private String companyName;
    private String companyWebsite;
    private String companySize;
    private String industry;
    private String description;
    private String locationCountry;
    private String locationCity;
    private String timezone;
    private String hiringNeeds;
    private BigDecimal averageBudgetMin;
    private BigDecimal averageBudgetMax;
    private String preferredContractType;
    private String languages;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocationCountry() {
        return locationCountry;
    }

    public void setLocationCountry(String locationCountry) {
        this.locationCountry = locationCountry;
    }

    public String getLocationCity() {
        return locationCity;
    }

    public void setLocationCity(String locationCity) {
        this.locationCity = locationCity;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getHiringNeeds() {
        return hiringNeeds;
    }

    public void setHiringNeeds(String hiringNeeds) {
        this.hiringNeeds = hiringNeeds;
    }

    public BigDecimal getAverageBudgetMin() {
        return averageBudgetMin;
    }

    public void setAverageBudgetMin(BigDecimal averageBudgetMin) {
        this.averageBudgetMin = averageBudgetMin;
    }

    public BigDecimal getAverageBudgetMax() {
        return averageBudgetMax;
    }

    public void setAverageBudgetMax(BigDecimal averageBudgetMax) {
        this.averageBudgetMax = averageBudgetMax;
    }

    public String getPreferredContractType() {
        return preferredContractType;
    }

    public void setPreferredContractType(String preferredContractType) {
        this.preferredContractType = preferredContractType;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }
}



