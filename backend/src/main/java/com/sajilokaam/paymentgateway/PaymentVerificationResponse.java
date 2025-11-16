package com.sajilokaam.paymentgateway;

import java.math.BigDecimal;

public class PaymentVerificationResponse {
    private boolean success;
    private String status; // SUCCESS, FAILED, PENDING
    private String transactionId;
    private String gatewayTransactionId;
    private BigDecimal amount;
    private String message;

    public PaymentVerificationResponse(boolean success, String status, String transactionId, String gatewayTransactionId, BigDecimal amount, String message) {
        this.success = success;
        this.status = status;
        this.transactionId = transactionId;
        this.gatewayTransactionId = gatewayTransactionId;
        this.amount = amount;
        this.message = message;
    }

    public static PaymentVerificationResponse success(String transactionId, String gatewayTransactionId, BigDecimal amount) {
        return new PaymentVerificationResponse(true, "SUCCESS", transactionId, gatewayTransactionId, amount, "Payment verified successfully");
    }

    public static PaymentVerificationResponse failure(String message) {
        return new PaymentVerificationResponse(false, "FAILED", null, null, null, message);
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

