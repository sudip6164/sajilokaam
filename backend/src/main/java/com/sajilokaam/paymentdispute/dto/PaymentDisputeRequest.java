package com.sajilokaam.paymentdispute.dto;

public class PaymentDisputeRequest {
    private String disputeType;
    private String reason;

    public String getDisputeType() {
        return disputeType;
    }

    public void setDisputeType(String disputeType) {
        this.disputeType = disputeType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

