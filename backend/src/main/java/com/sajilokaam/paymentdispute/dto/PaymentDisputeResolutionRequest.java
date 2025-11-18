package com.sajilokaam.paymentdispute.dto;

public class PaymentDisputeResolutionRequest {
    private String status;
    private String resolution;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }
}

