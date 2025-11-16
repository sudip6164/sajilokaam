package com.sajilokaam.paymentgateway.impl;

import com.sajilokaam.paymentgateway.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ESewaGateway implements PaymentGateway {
    
    @Value("${esewa.merchant.id:test_merchant_id}")
    private String merchantId;
    
    @Value("${esewa.secret.key:test_secret_key}")
    private String secretKey;
    
    @Value("${esewa.base.url:https://uat.esewa.com.np}")
    private String baseUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public PaymentInitiationResponse initiatePayment(PaymentRequest request) {
        try {
            // In production, this would make an actual API call to eSewa
            // For now, we'll simulate the response
            String paymentUrl = baseUrl + "/epay/main?" + buildPaymentParams(request);
            String transactionId = "ESW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Mock API call structure (commented out for production use):
            /*
            Map<String, String> params = new HashMap<>();
            params.put("amt", request.getAmount().toString());
            params.put("pdc", "0");
            params.put("psc", "0");
            params.put("txAmt", "0");
            params.put("tAmt", request.getAmount().toString());
            params.put("pid", request.getTransactionId());
            params.put("scd", merchantId);
            params.put("su", request.getReturnUrl());
            params.put("fu", request.getCancelUrl());
            
            // Generate hash
            String hashString = merchantId + "," + request.getProductIdentity() + "," + 
                               request.getAmount() + "," + "0,0,0," + request.getAmount() + "," + 
                               request.getReturnUrl() + "," + request.getCancelUrl() + "," + secretKey;
            String hash = generateMD5Hash(hashString);
            params.put("h", hash);
            */
            
            return PaymentInitiationResponse.success(paymentUrl, transactionId);
        } catch (Exception e) {
            return PaymentInitiationResponse.failure("Failed to initiate eSewa payment: " + e.getMessage(), "ESEWA_ERROR");
        }
    }

    @Override
    public PaymentVerificationResponse verifyPayment(String transactionId) {
        try {
            // Mock verification - in production, verify with eSewa API
            /*
            Map<String, String> params = new HashMap<>();
            params.put("pid", transactionId);
            params.put("scd", merchantId);
            
            // Generate verification hash
            String hashString = merchantId + "," + transactionId + "," + secretKey;
            String hash = generateMD5Hash(hashString);
            params.put("h", hash);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/epay/transrec",
                params,
                Map.class
            );
            */
            
            // Mock successful verification
            return PaymentVerificationResponse.success(
                transactionId,
                "ESW-GATEWAY-" + UUID.randomUUID().toString(),
                BigDecimal.valueOf(1000) // Mock amount
            );
        } catch (Exception e) {
            return PaymentVerificationResponse.failure("Failed to verify eSewa payment: " + e.getMessage());
        }
    }

    @Override
    public PaymentWebhookResponse processWebhook(Map<String, Object> webhookData) {
        try {
            // Process eSewa webhook/callback
            String pid = (String) webhookData.get("pid");
            String status = (String) webhookData.get("status");
            Object amountObj = webhookData.get("amt");
            BigDecimal amount = amountObj != null ? 
                new BigDecimal(amountObj.toString()) : BigDecimal.ZERO;
            
            return new PaymentWebhookResponse(
                "success".equals(status),
                pid,
                pid,
                status,
                amount,
                "Webhook processed"
            );
        } catch (Exception e) {
            return new PaymentWebhookResponse(false, null, null, "FAILED", null, e.getMessage());
        }
    }

    @Override
    public RefundResponse refund(String transactionId, BigDecimal amount, String reason) {
        try {
            // Mock refund - in production, call eSewa refund API
            String refundId = "ESW-REFUND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            return RefundResponse.success(refundId, amount);
        } catch (Exception e) {
            return RefundResponse.failure("Failed to process eSewa refund: " + e.getMessage(), "ESEWA_REFUND_ERROR");
        }
    }

    @Override
    public String getGatewayName() {
        return "ESEWA";
    }

    private String buildPaymentParams(PaymentRequest request) {
        // Build URL parameters for eSewa payment
        return "amt=" + request.getAmount() + 
               "&pid=" + request.getTransactionId() + 
               "&scd=" + merchantId + 
               "&su=" + request.getReturnUrl() + 
               "&fu=" + request.getCancelUrl();
    }
}

