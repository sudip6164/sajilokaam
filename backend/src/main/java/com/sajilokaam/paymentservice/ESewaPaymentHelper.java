package com.sajilokaam.paymentservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Component
public class ESewaPaymentHelper {
    
    @Value("${daisy.esewa.product_code:EPAYTEST}")
    private String productCode;

    @Value("${daisy.esewa.secret:8gBm/:&EnhH.1/q}")
    private String secret;

    public Map<String, Object> generateESewaPaymentData(Map<String, Object> payload, HttpServletRequest request) {
        Number total = (Number) payload.getOrDefault("total_amount", payload.getOrDefault("amount", 0));
        double totalAmount = total == null ? 0 : total.doubleValue();
        String totalStr = String.format(java.util.Locale.US, "%.2f", totalAmount);
        String txn = String.valueOf(System.currentTimeMillis());
        String signedFields = "total_amount,transaction_uuid,product_code";
        
        // Build message strictly from signed_fields order
        StringBuilder msg = new StringBuilder();
        String[] parts = signedFields.split(",");
        for (int i = 0; i < parts.length; i++) {
            String k = parts[i].trim();
            String v;
            switch (k) {
                case "total_amount": v = totalStr; break;
                case "transaction_uuid": v = txn; break;
                case "product_code": v = productCode; break;
                default: v = ""; break;
            }
            if (i > 0) msg.append(',');
            msg.append(k).append('=').append(v);
        }
        String message = msg.toString();
        String signature = hmacSha256Base64(secret, message);
        
        System.out.println("eSewa message: " + message);
        System.out.println("eSewa signature: " + signature);

        Map<String, Object> data = new HashMap<>();
        String baseUrl = request.getScheme() + "://" + request.getServerName() + 
                ((request.getServerPort() == 80 || request.getServerPort() == 443) ? "" : ":" + request.getServerPort());
        data.put("amount", totalStr);
        data.put("tax_amount", 0);
        data.put("total_amount", totalStr);
        data.put("transaction_uuid", txn);
        data.put("product_code", productCode);
        data.put("product_service_charge", 0);
        data.put("product_delivery_charge", 0);
        data.put("success_url", baseUrl + "/succefull.html");
        data.put("failure_url", baseUrl + "/payment-failure.html");
        data.put("signed_field_names", signedFields);
        data.put("signature", signature);
        data.put("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
        
        return data;
    }

    public boolean verifyESewaSignature(Map<String, Object> callbackData) {
        try {
            String receivedSignature = (String) callbackData.get("signature");
            if (receivedSignature == null) return false;
            
            String signedFields = (String) callbackData.get("signed_field_names");
            if (signedFields == null) signedFields = "total_amount,transaction_uuid,product_code";
            
            // Build message from signed fields
            StringBuilder msg = new StringBuilder();
            String[] parts = signedFields.split(",");
            for (int i = 0; i < parts.length; i++) {
                String k = parts[i].trim();
                Object vObj = callbackData.get(k);
                String v = vObj != null ? vObj.toString() : "";
                if (i > 0) msg.append(',');
                msg.append(k).append('=').append(v);
            }
            String message = msg.toString();
            String computedSignature = hmacSha256Base64(secret, message);
            
            return receivedSignature.equals(computedSignature);
        } catch (Exception e) {
            System.err.println("Error verifying eSewa signature: " + e.getMessage());
            return false;
        }
    }

    private static String hmacSha256Base64(String secret, String message) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] sig = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(sig);
        } catch (Exception e) {
            return "";
        }
    }
}

