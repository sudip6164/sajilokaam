package com.sajilokaam.pricing;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "http://localhost:5173")
public class PricingController {
    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public PricingController(SubscriptionPlanRepository planRepository,
                            UserSubscriptionRepository subscriptionRepository,
                            UserRepository userRepository,
                            JwtService jwtService) {
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getPlans() {
        List<SubscriptionPlan> plans = planRepository.findByActiveTrue();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/my-subscription")
    public ResponseEntity<UserSubscription> getMySubscription(
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

        Optional<UserSubscription> subscription = subscriptionRepository.findByUserIdAndIsActiveTrue(userOpt.get().getId());
        return subscription.map(ResponseEntity::ok)
            .orElseGet(() -> {
                // Return FREE plan as default
                Optional<SubscriptionPlan> freePlan = planRepository.findByName("FREE");
                if (freePlan.isPresent()) {
                    UserSubscription freeSub = new UserSubscription();
                    freeSub.setUser(userOpt.get());
                    freeSub.setPlan(freePlan.get());
                    freeSub.setBillingPeriod("MONTHLY");
                    freeSub.setStartDate(LocalDate.now());
                    freeSub.setIsActive(true);
                    return ResponseEntity.ok(freeSub);
                }
                return ResponseEntity.notFound().build();
            });
    }

    @PostMapping("/subscribe")
    public ResponseEntity<UserSubscription> subscribe(
            @RequestBody SubscriptionRequest request,
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

        Optional<SubscriptionPlan> planOpt = planRepository.findById(request.getPlanId());
        if (planOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Deactivate current subscription
        Optional<UserSubscription> currentSub = subscriptionRepository.findByUserIdAndIsActiveTrue(userOpt.get().getId());
        if (currentSub.isPresent()) {
            currentSub.get().setIsActive(false);
            subscriptionRepository.save(currentSub.get());
        }

        // Create new subscription
        UserSubscription subscription = new UserSubscription();
        subscription.setUser(userOpt.get());
        subscription.setPlan(planOpt.get());
        subscription.setBillingPeriod(request.getBillingPeriod());
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusMonths(request.getBillingPeriod().equals("YEARLY") ? 12 : 1));
        subscription.setIsActive(true);
        subscription.setAutoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : true);

        UserSubscription saved = subscriptionRepository.save(subscription);
        return ResponseEntity.ok(saved);
    }

    public static class SubscriptionRequest {
        private Long planId;
        private String billingPeriod;
        private Boolean autoRenew;

        public Long getPlanId() { return planId; }
        public void setPlanId(Long planId) { this.planId = planId; }

        public String getBillingPeriod() { return billingPeriod; }
        public void setBillingPeriod(String billingPeriod) { this.billingPeriod = billingPeriod; }

        public Boolean getAutoRenew() { return autoRenew; }
        public void setAutoRenew(Boolean autoRenew) { this.autoRenew = autoRenew; }
    }
}
