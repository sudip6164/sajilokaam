package com.sajilokaam.payment;

import com.sajilokaam.escrow.EscrowAccount;
import com.sajilokaam.escrow.EscrowAccountRepository;
import com.sajilokaam.invoice.Invoice;
import com.sajilokaam.invoice.InvoiceRepository;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;
    private final EscrowAccountRepository escrowAccountRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository,
            ProjectRepository projectRepository,
            EscrowAccountRepository escrowAccountRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.projectRepository = projectRepository;
        this.escrowAccountRepository = escrowAccountRepository;
    }

    /**
     * Demo/Test payment (bypasses gateway for development)
     */
    @PostMapping("/demo/initiate")
    public ResponseEntity<Map<String, Object>> initiateDemoPayment(
            @RequestBody InitPaymentRequest request) {
        
        System.out.println("=== Demo Payment Initiated ===");
        
        Map<String, Object> response = new HashMap<>();
        response.put("invoiceId", request.getInvoiceId());
        response.put("projectId", request.getProjectId());
        response.put("mode", "demo");
        response.put("message", "Demo payment - will auto-complete");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Demo/Test payment verification (auto-approve)
     */
    @PostMapping("/demo/verify")
    @Transactional
    public ResponseEntity<Map<String, Object>> verifyDemoPayment(
            @RequestBody Map<String, Object> request) {
        
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Long projectId = request.get("projectId") != null ? 
                           Long.valueOf(request.get("projectId").toString()) : null;
            
            System.out.println("=== Demo Payment Verification ===");
            System.out.println("Invoice ID: " + invoiceId);
            System.out.println("Project ID: " + projectId);
            
            Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found"));
            }

            Invoice invoice = invoiceOpt.get();
            
            // Create payment record
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(invoice.getTotalAmount());
            payment.setPaymentMethod("DEMO");
            payment.setGatewayTransactionId("DEMO-" + System.currentTimeMillis());
            payment.setStatus("COMPLETED");
            payment.setPaidAt(Instant.now());
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Update invoice status
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
            
            // Activate project
            if (projectId != null) {
                Optional<Project> projectOpt = projectRepository.findById(projectId);
                if (projectOpt.isPresent()) {
                    Project project = projectOpt.get();
                    project.setStatus("ACTIVE");
                    projectRepository.save(project);
                    
                    // Create escrow
                    Optional<EscrowAccount> existingEscrow = escrowAccountRepository.findByProject_Id(project.getId());
                    if (existingEscrow.isEmpty()) {
                        EscrowAccount escrow = new EscrowAccount();
                        escrow.setProject(project);
                        escrow.setTotalAmount(invoice.getTotalAmount());
                        escrow.setStatus("HELD");
                        escrow.setClient(invoice.getClient());
                        escrow.setFreelancer(invoice.getFreelancer());
                        escrowAccountRepository.save(escrow);
                    }
                    
                    return ResponseEntity.ok(Map.of(
                        "message", "Demo payment successful",
                        "paymentId", savedPayment.getId(),
                        "invoiceId", invoice.getId(),
                        "projectId", project.getId(),
                        "status", "SUCCESS"
                    ));
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Demo payment completed",
                "paymentId", savedPayment.getId(),
                "status", "SUCCESS"
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Initialize Khalti payment (Server-side, no widget)
     */
    @PostMapping("/khalti/initiate")
    public ResponseEntity<Map<String, Object>> initiateKhaltiPayment(
            @RequestBody InitPaymentRequest request) {
        
        try {
            // Verify invoice exists
            Optional<Invoice> invoiceOpt = invoiceRepository.findById(request.getInvoiceId());
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found"));
            }

            Invoice invoice = invoiceOpt.get();
            
            // Get secret key
            String secretKey = System.getenv("KHALTI_SECRET_KEY");
            if (secretKey == null || secretKey.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Khalti not configured"));
            }
            
            System.out.println("Secret key loaded: " + secretKey.substring(0, Math.min(10, secretKey.length())) + "...");
            
            // Try with both prefixed and unprefixed versions
            String[] keysToTry = {
                secretKey,
                "live_secret_key_" + secretKey,
                secretKey.replace("live_secret_key_", "")
            };
            
            System.out.println("Will try " + keysToTry.length + " key variations");
            
            // Generate Khalti payment parameters (amount in paisa - multiply by 100)
            long amountInPaisa = invoice.getTotalAmount().multiply(new BigDecimal("100")).longValue();
            String purchaseOrderId = "INV-" + invoice.getId();
            String purchaseOrderName = "Project Payment - Invoice #" + invoice.getId();
            
            // Return URLs
            String returnUrl = "http://localhost:5173/payment-success?invoiceId=" + 
                              invoice.getId() + "&projectId=" + request.getProjectId();
            String websiteUrl = "http://localhost:5173";
            
            System.out.println("=== Khalti Server-Side Payment Initiation ===");
            System.out.println("Amount in paisa: " + amountInPaisa);
            System.out.println("Purchase Order ID: " + purchaseOrderId);
            
            // Call Khalti Payment Initiate API (server-side)
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            String initiateUrl = "https://dev.khalti.com/api/v2/epayment/initiate/";
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("return_url", returnUrl);
            payload.put("website_url", websiteUrl);
            payload.put("amount", amountInPaisa);
            payload.put("purchase_order_id", purchaseOrderId);
            payload.put("purchase_order_name", purchaseOrderName);
            
            String jsonPayload = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
            System.out.println("Request payload: " + jsonPayload);
            
            java.net.http.HttpRequest initiateRequest = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(initiateUrl))
                .header("Authorization", "Key " + secretKey)
                .header("Content-Type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();
            
            java.net.http.HttpResponse<String> httpResponse = client.send(
                initiateRequest, 
                java.net.http.HttpResponse.BodyHandlers.ofString()
            );
            
            System.out.println("Khalti response status: " + httpResponse.statusCode());
            System.out.println("Khalti response body: " + httpResponse.body());
            
            if (httpResponse.statusCode() == 200) {
                // Parse response and return payment URL
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> khaltiResponse = mapper.readValue(httpResponse.body(), Map.class);
                
                return ResponseEntity.ok(Map.of(
                    "paymentUrl", khaltiResponse.get("payment_url"),
                    "pidx", khaltiResponse.get("pidx"),
                    "invoiceId", invoice.getId(),
                    "projectId", request.getProjectId()
                ));
            } else {
                System.err.println("Khalti initiation failed!");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to initiate Khalti payment",
                    "details", httpResponse.body()
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Payment initiation failed: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Verify Khalti payment
     */
    @PostMapping("/khalti/verify")
    @Transactional
    public ResponseEntity<Map<String, Object>> verifyKhaltiPayment(
            @RequestBody Map<String, Object> request) {
        
        try {
            System.out.println("=== Khalti Payment Verification ===");
            System.out.println("Request: " + request);
            
            String token = (String) request.get("token");
            Object amountObj = request.get("amount");
            Long invoiceId = request.get("invoiceId") != null ? 
                           Long.valueOf(request.get("invoiceId").toString()) : null;
            Long projectId = request.get("projectId") != null ? 
                           Long.valueOf(request.get("projectId").toString()) : null;
            
            if (token == null || amountObj == null || invoiceId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required parameters"));
            }
            
            // Convert amount from paisa to rupees
            long amountInPaisa = Long.valueOf(amountObj.toString());
            BigDecimal amountInRupees = new BigDecimal(amountInPaisa).divide(new BigDecimal("100"));
            
            Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found"));
            }

            Invoice invoice = invoiceOpt.get();
            
            // Check if already paid
            if ("PAID".equals(invoice.getStatus())) {
                System.out.println("Invoice already paid");
                Optional<Project> existingProject = projectId != null 
                    ? projectRepository.findById(projectId)
                    : projectRepository.findByClient_IdAndStatus(
                        invoice.getClient().getId(), "ACTIVE"
                      ).stream()
                       .filter(p -> p.getFreelancer().getId().equals(invoice.getFreelancer().getId()))
                       .findFirst();
                
                if (existingProject.isPresent()) {
                    return ResponseEntity.ok(Map.of(
                        "message", "Payment already verified",
                        "invoiceId", invoice.getId(),
                        "projectId", existingProject.get().getId(),
                        "status", "SUCCESS"
                    ));
                }
            }
            
            // Verify payment with Khalti API using secret key
            String secretKey = System.getenv("KHALTI_SECRET_KEY");
            if (secretKey != null && !secretKey.isEmpty()) {
                System.out.println("Verifying payment with Khalti API...");
                try {
                    // Call Khalti verification API
                    // Using dev.khalti.com for test-admin keys (based on working examples)
                    // Headers: Authorization: Key {secret_key}
                    // Body: { token, amount }
                    
                    java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                    // Use dev.khalti.com for development/test environment
                    String verifyUrl = "https://dev.khalti.com/api/v2/payment/verify/";
                    
                    String jsonBody = String.format("{\"token\": \"%s\", \"amount\": %d}", 
                                                   token, amountInPaisa);
                    
                    java.net.http.HttpRequest verifyRequest = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(verifyUrl))
                        .header("Authorization", "Key " + secretKey)
                        .header("Content-Type", "application/json")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();
                    
                    java.net.http.HttpResponse<String> response = client.send(
                        verifyRequest, 
                        java.net.http.HttpResponse.BodyHandlers.ofString()
                    );
                    
                    System.out.println("Khalti verification response status: " + response.statusCode());
                    System.out.println("Khalti verification response body: " + response.body());
                    
                    if (response.statusCode() != 200) {
                        System.err.println("Khalti verification failed!");
                        return ResponseEntity.badRequest().body(Map.of(
                            "error", "Payment verification failed with Khalti"
                        ));
                    }
                } catch (Exception e) {
                    System.err.println("Error verifying with Khalti: " + e.getMessage());
                    e.printStackTrace();
                    // Continue anyway for development
                }
            } else {
                System.out.println("Warning: No secret key configured, skipping Khalti verification");
            }
            
            // Create payment record
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(amountInRupees);
            payment.setPaymentMethod("KHALTI");
            payment.setGatewayTransactionId(token);
            payment.setStatus("COMPLETED");
            payment.setPaidAt(Instant.now());
            
            Payment savedPayment = paymentRepository.save(payment);
            System.out.println("Created payment record: " + savedPayment.getId());
            
            // Update invoice status
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
            System.out.println("Updated invoice status to PAID");
            
            // Find and activate project
            Optional<Project> projectOpt;
            if (projectId != null) {
                projectOpt = projectRepository.findById(projectId);
            } else {
                projectOpt = projectRepository.findByClient_IdAndStatus(
                    invoice.getClient().getId(), "PENDING_PAYMENT"
                ).stream()
                 .filter(p -> p.getFreelancer().getId().equals(invoice.getFreelancer().getId()))
                 .findFirst();
            }
            
            if (projectOpt.isPresent()) {
                Project project = projectOpt.get();
                project.setStatus("ACTIVE");
                projectRepository.save(project);
                System.out.println("Activated project: " + project.getId());
                
                // Create escrow account if not exists
                Optional<EscrowAccount> existingEscrow = escrowAccountRepository.findByProject_Id(project.getId());
                EscrowAccount savedEscrow;
                
                if (existingEscrow.isEmpty()) {
                    EscrowAccount escrow = new EscrowAccount();
                    escrow.setProject(project);
                    escrow.setTotalAmount(invoice.getTotalAmount());
                    escrow.setStatus("HELD");
                    escrow.setClient(invoice.getClient());
                    escrow.setFreelancer(invoice.getFreelancer());
                    savedEscrow = escrowAccountRepository.save(escrow);
                    System.out.println("Created escrow account: " + savedEscrow.getId());
                } else {
                    savedEscrow = existingEscrow.get();
                    System.out.println("Escrow account already exists: " + savedEscrow.getId());
                }
                
                return ResponseEntity.ok(Map.of(
                    "message", "Payment verified successfully",
                    "paymentId", savedPayment.getId(),
                    "invoiceId", invoice.getId(),
                    "projectId", project.getId(),
                    "escrowId", savedEscrow.getId(),
                    "status", "SUCCESS"
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Payment verified but project not found",
                "paymentId", savedPayment.getId(),
                "invoiceId", invoiceId,
                "status", "PARTIAL_SUCCESS"
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Khalti payment verification error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Payment verification failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Initialize eSewa payment
     */
    @PostMapping("/esewa/initiate")
    public ResponseEntity<Map<String, Object>> initializePayment(
            @RequestBody InitPaymentRequest request) {
        
        // Verify invoice exists
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(request.getInvoiceId());
        if (invoiceOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found"));
        }

        Invoice invoice = invoiceOpt.get();
        
        // eSewa Test Environment Configuration
        String merchantCode = "EPAYTEST";
        String secretKey = "8gBm/:&EnhH.1/q";
        
        // Generate eSewa payment parameters
        String productCode = "INV-" + invoice.getId();
        double amount = invoice.getTotalAmount().doubleValue();
        String transactionUuid = "TXN-" + System.currentTimeMillis();
        
        // eSewa URLs
        String successUrl = "http://localhost:5173/payment-success?invoiceId=" + invoice.getId() + "&projectId=" + request.getProjectId();
        String failureUrl = "http://localhost:5173/payment-failure";
        
        // Format amount as integer (no decimals)
        long totalAmountInt = Math.round(amount);
        
        // Generate signature using the exact format eSewa expects
        String message = String.format("total_amount=%d,transaction_uuid=%s,product_code=%s",
                totalAmountInt, transactionUuid, merchantCode);
        
        System.out.println("=== eSewa Payment Debug ===");
        System.out.println("Message to sign: " + message);
        System.out.println("Secret key: " + secretKey);
        
        String signature = generateHmacSHA256Signature(message, secretKey);
        System.out.println("Generated signature: " + signature);
        System.out.println("=========================");
        
        Map<String, Object> response = new HashMap<>();
        response.put("productCode", merchantCode);
        response.put("productId", productCode);
        response.put("amount", totalAmountInt);
        response.put("taxAmount", 0);
        response.put("totalAmount", totalAmountInt);
        response.put("transactionUuid", transactionUuid);
        response.put("productServiceCharge", 0);
        response.put("productDeliveryCharge", 0);
        response.put("successUrl", successUrl);
        response.put("failureUrl", failureUrl);
        response.put("signedFieldNames", "total_amount,transaction_uuid,product_code");
        response.put("signature", signature);
        response.put("esewaPaymentUrl", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
        
        return ResponseEntity.ok(response);
    }
    
    private String generateHmacSHA256Signature(String message, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(message.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }

    /**
     * Handle eSewa payment success callback
     */
    @PostMapping("/esewa/verify")
    @Transactional
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody VerifyPaymentRequest request) {
        
        try {
            System.out.println("=== Payment Verification ===");
            System.out.println("Request: " + request);
            System.out.println("ProductId: " + request.getProductId());
            System.out.println("InvoiceId: " + request.getInvoiceId());
            System.out.println("ProjectId: " + request.getProjectId());
            
            // Get invoice ID (from direct param or extract from productId)
            Long invoiceId;
            if (request.getInvoiceId() != null) {
                invoiceId = request.getInvoiceId();
            } else if (request.getProductId() != null && request.getProductId().startsWith("INV-")) {
                invoiceId = Long.parseLong(request.getProductId().replace("INV-", ""));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invoice ID not provided"));
            }
            
            Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found"));
            }

            Invoice invoice = invoiceOpt.get();
            
            // Check if already paid
            if ("PAID".equals(invoice.getStatus())) {
                System.out.println("Invoice already paid, returning existing data");
                // Find the project
                Optional<Project> existingProject = request.getProjectId() != null 
                    ? projectRepository.findById(request.getProjectId())
                    : projectRepository.findByClient_IdAndStatus(
                        invoice.getClient().getId(), "ACTIVE"
                      ).stream()
                       .filter(p -> p.getFreelancer().getId().equals(invoice.getFreelancer().getId()))
                       .findFirst();
                
                if (existingProject.isPresent()) {
                    return ResponseEntity.ok(Map.of(
                        "message", "Payment already verified",
                        "invoiceId", invoice.getId(),
                        "projectId", existingProject.get().getId(),
                        "status", "SUCCESS"
                    ));
                }
            }
            
            // TODO: In production, verify payment with eSewa API
            // For now, we trust the callback
            
            // Create payment record
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(invoice.getTotalAmount());
            payment.setPaymentMethod("ESEWA");
            payment.setGatewayTransactionId(request.getTransactionCode());
            payment.setStatus("COMPLETED");
            payment.setPaidAt(Instant.now());
            
            Payment savedPayment = paymentRepository.save(payment);
            System.out.println("Created payment record: " + savedPayment.getId());
            
            // Update invoice status
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
            System.out.println("Updated invoice status to PAID");
            
            // Find and activate project
            Optional<Project> projectOpt;
            if (request.getProjectId() != null) {
                projectOpt = projectRepository.findById(request.getProjectId());
            } else {
                projectOpt = projectRepository.findByClient_IdAndStatus(
                    invoice.getClient().getId(), "PENDING_PAYMENT"
                ).stream()
                 .filter(p -> p.getFreelancer().getId().equals(invoice.getFreelancer().getId()))
                 .findFirst();
            }
            
            if (projectOpt.isPresent()) {
                Project project = projectOpt.get();
                project.setStatus("ACTIVE");
                projectRepository.save(project);
                System.out.println("Activated project: " + project.getId());
                
                // Create escrow account if not exists
                Optional<EscrowAccount> existingEscrow = escrowAccountRepository.findByProject_Id(project.getId());
                EscrowAccount savedEscrow;
                
                if (existingEscrow.isEmpty()) {
                    EscrowAccount escrow = new EscrowAccount();
                    escrow.setProject(project);
                    escrow.setTotalAmount(invoice.getTotalAmount());
                    escrow.setStatus("HELD");
                    escrow.setClient(invoice.getClient());
                    escrow.setFreelancer(invoice.getFreelancer());
                    savedEscrow = escrowAccountRepository.save(escrow);
                    System.out.println("Created escrow account: " + savedEscrow.getId());
                } else {
                    savedEscrow = existingEscrow.get();
                    System.out.println("Escrow account already exists: " + savedEscrow.getId());
                }
                
                return ResponseEntity.ok(Map.of(
                    "message", "Payment verified successfully",
                    "paymentId", savedPayment.getId(),
                    "invoiceId", invoice.getId(),
                    "projectId", project.getId(),
                    "escrowId", savedEscrow.getId(),
                    "status", "SUCCESS"
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Payment verified but project not found",
                "paymentId", savedPayment.getId(),
                "invoiceId", invoiceId,
                "status", "PARTIAL_SUCCESS"
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Payment verification error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Payment verification failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Get payment details
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPayment(@PathVariable Long paymentId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(paymentOpt.get());
    }

    // Request DTOs
    public static class InitPaymentRequest {
        private Long invoiceId;
        private Long projectId;

        public Long getInvoiceId() { return invoiceId; }
        public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
        
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }

    public static class VerifyPaymentRequest {
        private String productId;
        private String transactionCode;
        private BigDecimal amount;
        private Long invoiceId;
        private Long projectId;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public String getTransactionCode() { return transactionCode; }
        public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public Long getInvoiceId() { return invoiceId; }
        public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
        
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }
}
