package com.sajilokaam.paymentgateway;

public class PaymentInitiationResponse {
    private boolean success;
    private String paymentUrl;
    private String transactionId;
    private String message;
    private String errorCode;

    public PaymentInitiationResponse(boolean success, String paymentUrl, String transactionId, String message) {
        this.success = success;
        this.paymentUrl = paymentUrl;
        this.transactionId = transactionId;
        this.message = message;
    }

    public static PaymentInitiationResponse success(String paymentUrl, String transactionId) {
        return new PaymentInitiationResponse(true, paymentUrl, transactionId, "Payment initiated successfully");
    }

    public static PaymentInitiationResponse failure(String message, String errorCode) {
        PaymentInitiationResponse response = new PaymentInitiationResponse(false, null, null, message);
        response.setErrorCode(errorCode);
        return response;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
}

