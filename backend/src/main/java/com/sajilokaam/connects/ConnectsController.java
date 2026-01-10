package com.sajilokaam.connects;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/connects")
@CrossOrigin(origins = "http://localhost:5173")
public class ConnectsController {

    private final ConnectsService connectsService;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ConnectTransactionRepository connectTransactionRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public ConnectsController(
            ConnectsService connectsService,
            FreelancerProfileRepository freelancerProfileRepository,
            ConnectTransactionRepository connectTransactionRepository,
            JwtService jwtService,
            UserRepository userRepository) {
        this.connectsService = connectsService;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.connectTransactionRepository = connectTransactionRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Get current connects balance
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(
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

        int balance = connectsService.getConnectsBalance(userOpt.get().getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("connects", balance);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get transaction history
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<ConnectTransaction>> getTransactions(
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

        List<ConnectTransaction> transactions = connectTransactionRepository
                .findByUserIdOrderByCreatedAtDesc(userOpt.get().getId());
        
        return ResponseEntity.ok(transactions);
    }

    /**
     * Purchase connects
     */
    @PostMapping("/purchase")
    public ResponseEntity<Map<String, Object>> purchaseConnects(
            @RequestBody PurchaseRequest request,
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

        User user = userOpt.get();
        
        // Validate amount
        if (request.getAmount() == null || request.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // Purchase connects
        connectsService.purchaseConnects(
                user,
                request.getAmount(),
                request.getPaymentReference()
        );

        // Get new balance
        int newBalance = connectsService.getConnectsBalance(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Connects purchased successfully");
        response.put("newBalance", newBalance);

        return ResponseEntity.ok(response);
    }

    /**
     * Request class for purchase
     */
    public static class PurchaseRequest {
        private Integer amount;
        private String paymentReference;

        public Integer getAmount() {
            return amount;
        }

        public void setAmount(Integer amount) {
            this.amount = amount;
        }

        public String getPaymentReference() {
            return paymentReference;
        }

        public void setPaymentReference(String paymentReference) {
            this.paymentReference = paymentReference;
        }
    }
}
