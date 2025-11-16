package com.sajilokaam.payment;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.invoice.Invoice;
import com.sajilokaam.invoice.InvoiceRepository;
import com.sajilokaam.paymentgateway.PaymentInitiationResponse;
import com.sajilokaam.paymentgateway.PaymentVerificationResponse;
import com.sajilokaam.paymentgateway.RefundResponse;
import com.sajilokaam.paymentservice.PaymentService;
import com.sajilokaam.transaction.Transaction;
import com.sajilokaam.transaction.TransactionRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PaymentService paymentService;
    private final TransactionRepository transactionRepository;

    public PaymentController(PaymentRepository paymentRepository,
                            InvoiceRepository invoiceRepository,
                            UserRepository userRepository,
                            JwtService jwtService,
                            PaymentService paymentService,
                            TransactionRepository transactionRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.paymentService = paymentService;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<Payment>> getInvoicePayments(@PathVariable Long invoiceId) {
        if (!invoiceRepository.existsById(invoiceId)) {
            return ResponseEntity.notFound().build();
        }
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByCreatedAtDesc(invoiceId);
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(
            @RequestBody PaymentCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Invoice> invoiceOpt = invoiceRepository.findById(request.getInvoiceId());
        if (invoiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Invoice invoice = invoiceOpt.get();

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentReference(request.getPaymentReference());
        payment.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        payment.setNotes(request.getNotes());

        if ("COMPLETED".equals(payment.getStatus())) {
            payment.setPaidAt(Instant.now());
            // Update invoice status if fully paid
            updateInvoicePaymentStatus(invoice);
        }

        Payment created = paymentRepository.save(payment);
        URI location = URI.create("/api/payments/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody PaymentStatusUpdateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Payment payment = paymentOpt.get();
        payment.setStatus(request.getStatus());

        if ("COMPLETED".equals(request.getStatus()) && payment.getPaidAt() == null) {
            payment.setPaidAt(Instant.now());
        }

        Payment updated = paymentRepository.save(payment);
        
        // Update invoice payment status
        updateInvoicePaymentStatus(payment.getInvoice());

        return ResponseEntity.ok(updated);
    }

    private void updateInvoicePaymentStatus(Invoice invoice) {
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByCreatedAtDesc(invoice.getId());
        java.math.BigDecimal totalPaid = payments.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
            if (invoice.getPaidAt() == null) {
                invoice.setPaidAt(Instant.now());
            }
            invoiceRepository.save(invoice);
        } else if (totalPaid.compareTo(java.math.BigDecimal.ZERO) > 0) {
            invoice.setStatus("PARTIAL");
            invoiceRepository.save(invoice);
        }
    }

    public static class PaymentCreateRequest {
        private Long invoiceId;
        private java.math.BigDecimal amount;
        private String paymentMethod;
        private String paymentReference;
        private String status;
        private String notes;

        public Long getInvoiceId() { return invoiceId; }
        public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentReference() { return paymentReference; }
        public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PaymentStatusUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class PaymentInitiateRequest {
        private String gateway;
        private String returnUrl;
        private String cancelUrl;

        public String getGateway() { return gateway; }
        public void setGateway(String gateway) { this.gateway = gateway; }
        public String getReturnUrl() { return returnUrl; }
        public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
        public String getCancelUrl() { return cancelUrl; }
        public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
    }

    public static class RefundRequest {
        private java.math.BigDecimal amount;
        private String reason;

        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}

