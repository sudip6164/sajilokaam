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
public class KhaltiGateway implements PaymentGateway {
    
    @Value("${khalti.secret.key:test_secret_key}")
    private String secretKey;
    
    @Value("${khalti.public.key:test_public_key}")
    private String publicKey;
    
    @Value("${khalti.base.url:https://khalti.com/api/v2}")
    private String baseUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public PaymentInitiationResponse initiatePayment(PaymentRequest request) {
        try {
            // In production, this would make an actual API call to Khalti
            // For now, we'll simulate the response
            String paymentUrl = baseUrl + "/payment/initiate/" + UUID.randomUUID().toString();
            String transactionId = "KHT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Mock API call structure (commented out for production use):
            /*
            Map<String, Object> payload = new HashMap<>();
            payload.put("return_url", request.getReturnUrl());
            payload.put("website_url", "https://sajilokaam.com");
            payload.put("amount", request.getAmount().multiply(BigDecimal.valueOf(100)).intValue()); // Khalti uses paisa
            payload.put("purchase_order_id", request.getTransactionId());
            payload.put("purchase_order_name", request.getProductName());
            payload.put("customer_info", Map.of(
                "name", request.getCustomerName(),
                "email", request.getCustomerEmail(),
                "phone", request.getCustomerPhone()
            ));
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Key " + secretKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/epayment/initiate/", entity, Map.class
            );
            */
            
            return PaymentInitiationResponse.success(paymentUrl, transactionId);
        } catch (Exception e) {
            return PaymentInitiationResponse.failure("Failed to initiate Khalti payment: " + e.getMessage(), "KHALTI_ERROR");
        }
    }

    @Override
    public PaymentVerificationResponse verifyPayment(String transactionId) {
        try {
            // Mock verification - in production, verify with Khalti API
            /*
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Key " + secretKey);
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/epayment/lookup/",
                HttpMethod.POST,
                entity,
                Map.class,
                Map.of("pidx", transactionId)
            );
            */
            
            // Mock successful verification
            return PaymentVerificationResponse.success(
                transactionId,
                "KHT-GATEWAY-" + UUID.randomUUID().toString(),
                BigDecimal.valueOf(1000) // Mock amount
            );
        } catch (Exception e) {
            return PaymentVerificationResponse.failure("Failed to verify Khalti payment: " + e.getMessage());
        }
    }

    @Override
    public PaymentWebhookResponse processWebhook(Map<String, Object> webhookData) {
        try {
            // Process Khalti webhook
            String pidx = (String) webhookData.get("pidx");
            String status = (String) webhookData.get("status");
            Object amountObj = webhookData.get("total_amount");
            BigDecimal amount = amountObj != null ? 
                BigDecimal.valueOf(((Number) amountObj).doubleValue()).divide(BigDecimal.valueOf(100)) : 
                BigDecimal.ZERO;
            
            return new PaymentWebhookResponse(
                "Completed".equals(status),
                pidx,
                pidx,
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
            // Mock refund - in production, call Khalti refund API
            String refundId = "KHT-REFUND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            return RefundResponse.success(refundId, amount);
        } catch (Exception e) {
            return RefundResponse.failure("Failed to process Khalti refund: " + e.getMessage(), "KHALTI_REFUND_ERROR");
        }
    }

    @Override
    public String getGatewayName() {
        return "KHALTI";
    }
}

