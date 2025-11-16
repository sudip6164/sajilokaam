package com.sajilokaam.paymentgateway;

import java.math.BigDecimal;

public class RefundResponse {
    private boolean success;
    private String refundId;
    private BigDecimal refundAmount;
    private String message;
    private String errorCode;

    public RefundResponse(boolean success, String refundId, BigDecimal refundAmount, String message) {
        this.success = success;
        this.refundId = refundId;
        this.refundAmount = refundAmount;
        this.message = message;
    }

    public static RefundResponse success(String refundId, BigDecimal refundAmount) {
        return new RefundResponse(true, refundId, refundAmount, "Refund processed successfully");
    }

    public static RefundResponse failure(String message, String errorCode) {
        RefundResponse response = new RefundResponse(false, null, null, message);
        response.setErrorCode(errorCode);
        return response;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getRefundId() { return refundId; }
    public void setRefundId(String refundId) { this.refundId = refundId; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
}

