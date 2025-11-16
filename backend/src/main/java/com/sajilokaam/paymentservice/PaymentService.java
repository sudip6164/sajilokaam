package com.sajilokaam.paymentservice;

import com.sajilokaam.payment.Payment;
import com.sajilokaam.payment.PaymentRepository;
import com.sajilokaam.paymentgateway.*;
import com.sajilokaam.paymentgateway.impl.KhaltiGateway;
import com.sajilokaam.paymentgateway.impl.ESewaGateway;
import com.sajilokaam.transaction.Transaction;
import com.sajilokaam.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final KhaltiGateway khaltiGateway;
    private final ESewaGateway eSewaGateway;

    public PaymentService(PaymentRepository paymentRepository,
                         TransactionRepository transactionRepository,
                         KhaltiGateway khaltiGateway,
                         ESewaGateway eSewaGateway) {
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.khaltiGateway = khaltiGateway;
        this.eSewaGateway = eSewaGateway;
    }

    public PaymentInitiationResponse initiatePayment(Payment payment, String gateway, String returnUrl, String cancelUrl) {
        PaymentGateway gatewayImpl = getGateway(gateway);
        if (gatewayImpl == null) {
            return PaymentInitiationResponse.failure("Invalid payment gateway", "INVALID_GATEWAY");
        }

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setTransactionId("TXN-" + UUID.randomUUID().toString().toUpperCase());
        transaction.setPayment(payment);
        transaction.setGateway(gateway);
        transaction.setAmount(payment.getAmount());
        transaction.setCurrency("NPR");
        transaction.setStatus("PENDING");
        transaction = transactionRepository.save(transaction);

        // Build payment request
        PaymentRequest request = new PaymentRequest();
        request.setTransactionId(transaction.getTransactionId());
        request.setAmount(payment.getAmount());
        request.setCurrency("NPR");
        request.setReturnUrl(returnUrl);
        request.setCancelUrl(cancelUrl);
        request.setCustomerName(payment.getInvoice().getClient().getFullName());
        request.setCustomerEmail(payment.getInvoice().getClient().getEmail());
        request.setProductName("Invoice #" + payment.getInvoice().getInvoiceNumber());
        request.setProductIdentity(payment.getInvoice().getId().toString());

        // Initiate payment with gateway
        PaymentInitiationResponse response = gatewayImpl.initiatePayment(request);
        
        if (response.isSuccess()) {
            transaction.setGatewayTransactionId(response.getTransactionId());
            transactionRepository.save(transaction);
        }

        return response;
    }

    public PaymentVerificationResponse verifyPayment(String transactionId) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        PaymentGateway gateway = getGateway(transaction.getGateway());
        if (gateway == null) {
            return PaymentVerificationResponse.failure("Invalid payment gateway");
        }

        PaymentVerificationResponse response = gateway.verifyPayment(transactionId);
        
        if (response.isSuccess() && "SUCCESS".equals(response.getStatus())) {
            transaction.setStatus("SUCCESS");
            transaction.setProcessedAt(Instant.now());
            transaction.setGatewayTransactionId(response.getGatewayTransactionId());
            transactionRepository.save(transaction);

            // Update payment status
            Payment payment = transaction.getPayment();
            if (payment != null) {
                payment.setStatus("COMPLETED");
                payment.setPaidAt(Instant.now());
                payment.setGateway(transaction.getGateway());
                payment.setGatewayTransactionId(response.getGatewayTransactionId());
                paymentRepository.save(payment);
            }
        } else {
            transaction.setStatus("FAILED");
            transaction.setFailureReason(response.getMessage());
            transactionRepository.save(transaction);
        }

        return response;
    }

    public PaymentWebhookResponse processWebhook(String gateway, Map<String, Object> webhookData) {
        PaymentGateway gatewayImpl = getGateway(gateway);
        if (gatewayImpl == null) {
            return new PaymentWebhookResponse(false, null, null, "FAILED", null, "Invalid gateway");
        }

        PaymentWebhookResponse response = gatewayImpl.processWebhook(webhookData);
        
        if (response.isSuccess()) {
            Transaction transaction = transactionRepository.findByTransactionId(response.getTransactionId())
                    .orElse(null);
            
            if (transaction != null) {
                transaction.setStatus("SUCCESS");
                transaction.setProcessedAt(Instant.now());
                transaction.setGatewayTransactionId(response.getGatewayTransactionId());
                transactionRepository.save(transaction);

                Payment payment = transaction.getPayment();
                if (payment != null) {
                    payment.setStatus("COMPLETED");
                    payment.setPaidAt(Instant.now());
                    payment.setGateway(transaction.getGateway());
                    payment.setGatewayTransactionId(response.getGatewayTransactionId());
                    paymentRepository.save(payment);
                }
            }
        }

        return response;
    }

    public RefundResponse refund(String transactionId, BigDecimal amount, String reason) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        PaymentGateway gateway = getGateway(transaction.getGateway());
        if (gateway == null) {
            return RefundResponse.failure("Invalid payment gateway", "INVALID_GATEWAY");
        }

        RefundResponse response = gateway.refund(transaction.getGatewayTransactionId(), amount, reason);
        
        if (response.isSuccess()) {
            transaction.setStatus("REFUNDED");
            transactionRepository.save(transaction);

            Payment payment = transaction.getPayment();
            if (payment != null) {
                payment.setStatus("REFUNDED");
                paymentRepository.save(payment);
            }
        }

        return response;
    }

    private PaymentGateway getGateway(String gateway) {
        if ("KHALTI".equalsIgnoreCase(gateway)) {
            return khaltiGateway;
        } else if ("ESEWA".equalsIgnoreCase(gateway)) {
            return eSewaGateway;
        }
        return null;
    }
}

