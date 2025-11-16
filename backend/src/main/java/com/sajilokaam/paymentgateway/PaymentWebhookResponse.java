package com.sajilokaam.paymentgateway;

import java.math.BigDecimal;

public class PaymentWebhookResponse {
    private boolean success;
    private String transactionId;
    private String gatewayTransactionId;
    private String status;
    private BigDecimal amount;
    private String message;

    public PaymentWebhookResponse(boolean success, String transactionId, String gatewayTransactionId, String status, BigDecimal amount, String message) {
        this.success = success;
        this.transactionId = transactionId;
        this.gatewayTransactionId = gatewayTransactionId;
        this.status = status;
        this.amount = amount;
        this.message = message;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

