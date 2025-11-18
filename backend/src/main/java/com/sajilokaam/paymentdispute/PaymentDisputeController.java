package com.sajilokaam.paymentdispute;

import com.sajilokaam.paymentdispute.dto.PaymentDisputeRequest;
import com.sajilokaam.paymentdispute.dto.PaymentDisputeResolutionRequest;
import com.sajilokaam.paymentdispute.dto.PaymentDisputeResponse;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentDisputeController {

    private final PaymentDisputeService disputeService;
    private final UserContextService userContextService;

    public PaymentDisputeController(PaymentDisputeService disputeService,
                                    UserContextService userContextService) {
        this.disputeService = disputeService;
        this.userContextService = userContextService;
    }

    @GetMapping({
            "/api/payments/{paymentId}/disputes",
            "/api/payment-disputes/payment/{paymentId}"
    })
    public ResponseEntity<List<PaymentDisputeResponse>> getPaymentDisputes(
            @PathVariable Long paymentId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        List<PaymentDisputeResponse> responses = disputeService.getDisputesForPayment(paymentId, userOpt.get());
        return ResponseEntity.ok(responses);
    }

    @GetMapping({
            "/api/payments/disputes/my",
            "/api/payment-disputes/my"
    })
    public ResponseEntity<List<PaymentDisputeResponse>> getMyDisputes(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(disputeService.getDisputesForUser(userOpt.get()));
    }

    @GetMapping({
            "/api/payments/disputes",
            "/api/payment-disputes"
    })
    public ResponseEntity<List<PaymentDisputeResponse>> getAllDisputes(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty() || userOpt.get().getRoles().stream().noneMatch(role -> role.getName().equalsIgnoreCase("ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(disputeService.getAllDisputes());
    }

    @PostMapping({
            "/api/payments/{paymentId}/disputes",
            "/api/payment-disputes/payment/{paymentId}"
    })
    public ResponseEntity<PaymentDisputeResponse> createDispute(
            @PathVariable Long paymentId,
            @RequestBody PaymentDisputeRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        try {
            PaymentDisputeResponse response = disputeService.raiseDispute(paymentId, request, userOpt.get());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping({
            "/api/payments/disputes/{disputeId}/resolve",
            "/api/payment-disputes/{disputeId}/resolve"
    })
    public ResponseEntity<PaymentDisputeResponse> resolveDispute(
            @PathVariable Long disputeId,
            @RequestBody PaymentDisputeResolutionRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty() || userOpt.get().getRoles().stream().noneMatch(role -> role.getName().equalsIgnoreCase("ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        try {
            return ResponseEntity.ok(disputeService.resolveDispute(disputeId, request, userOpt.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

