package com.sajilokaam.paymentgateway;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentGateway {
    /**
     * Initialize a payment and return payment URL/initiation data
     */
    PaymentInitiationResponse initiatePayment(PaymentRequest request);
    
    /**
     * Verify payment status from gateway
     */
    PaymentVerificationResponse verifyPayment(String transactionId);
    
    /**
     * Process webhook/callback from gateway
     */
    PaymentWebhookResponse processWebhook(Map<String, Object> webhookData);
    
    /**
     * Refund a payment
     */
    RefundResponse refund(String transactionId, BigDecimal amount, String reason);
    
    /**
     * Get gateway name
     */
    String getGatewayName();
}

