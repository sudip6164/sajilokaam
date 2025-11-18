package com.sajilokaam.admin;

import com.sajilokaam.admin.dto.PaymentDashboardResponse;
import com.sajilokaam.auth.RequiresAdmin;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminPaymentController {

    private final PaymentAnalyticsService paymentAnalyticsService;

    public AdminPaymentController(PaymentAnalyticsService paymentAnalyticsService) {
        this.paymentAnalyticsService = paymentAnalyticsService;
    }

    @GetMapping("/dashboard")
    public PaymentDashboardResponse getDashboard() {
        return paymentAnalyticsService.getDashboard();
    }
}

