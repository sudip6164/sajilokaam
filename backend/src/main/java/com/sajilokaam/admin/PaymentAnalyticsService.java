package com.sajilokaam.admin;

import com.sajilokaam.admin.dto.PaymentDashboardResponse;
import com.sajilokaam.payment.Payment;
import com.sajilokaam.payment.PaymentRepository;
import com.sajilokaam.paymentdispute.PaymentDispute;
import com.sajilokaam.paymentdispute.PaymentDisputeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentAnalyticsService {

    private final PaymentRepository paymentRepository;
    private final PaymentDisputeRepository disputeRepository;

    public PaymentAnalyticsService(PaymentRepository paymentRepository,
                                   PaymentDisputeRepository disputeRepository) {
        this.paymentRepository = paymentRepository;
        this.disputeRepository = disputeRepository;
    }

    @Transactional(readOnly = true)
    public PaymentDashboardResponse getDashboard() {
        PaymentDashboardResponse response = new PaymentDashboardResponse();

        response.setSummary(buildSummary());
        response.setGateways(buildGatewayBreakdown());
        response.setStatuses(buildStatusBreakdown());
        response.setRecentPayments(buildRecentPayments());
        response.setDisputes(buildDisputeSummary());
        response.setRecentDisputes(buildRecentDisputes());

        return response;
    }

    private PaymentDashboardResponse.PaymentSummary buildSummary() {
        BigDecimal totalCollected = safe(paymentRepository.sumAmountByStatus("COMPLETED"));
        BigDecimal pending = safe(paymentRepository.sumAmountByStatus("PENDING"));
        BigDecimal refunded = safe(paymentRepository.sumAmountByStatus("REFUNDED"));
        long totalTransactions = paymentRepository.count();
        long completedCount = paymentRepository.countByStatus("COMPLETED");

        BigDecimal averageTicket = completedCount > 0
                ? totalCollected.divide(BigDecimal.valueOf(completedCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        PaymentDashboardResponse.PaymentSummary summary = new PaymentDashboardResponse.PaymentSummary();
        summary.setTotalCollected(totalCollected);
        summary.setPendingAmount(pending);
        summary.setRefundedAmount(refunded);
        summary.setAverageTicketSize(averageTicket);
        summary.setTotalTransactions(totalTransactions);
        return summary;
    }

    private List<PaymentDashboardResponse.GatewayBreakdown> buildGatewayBreakdown() {
        List<Object[]> raw = paymentRepository.aggregateByGateway();
        List<PaymentDashboardResponse.GatewayBreakdown> breakdowns = new ArrayList<>();

        for (Object[] row : raw) {
            PaymentDashboardResponse.GatewayBreakdown breakdown = new PaymentDashboardResponse.GatewayBreakdown();
            breakdown.setGateway(row[0] != null ? row[0].toString() : "OFFLINE");
            breakdown.setCount(asLong(row[1]));
            breakdown.setTotalAmount(row[2] instanceof BigDecimal ? (BigDecimal) row[2] : BigDecimal.ZERO);
            breakdowns.add(breakdown);
        }
        return breakdowns;
    }

    private List<PaymentDashboardResponse.StatusBreakdown> buildStatusBreakdown() {
        List<Object[]> raw = paymentRepository.aggregateStatusCounts();
        return raw.stream().map(row -> {
            PaymentDashboardResponse.StatusBreakdown breakdown = new PaymentDashboardResponse.StatusBreakdown();
            breakdown.setStatus(row[0] != null ? row[0].toString() : "UNKNOWN");
            breakdown.setCount(asLong(row[1]));
            return breakdown;
        }).collect(Collectors.toList());
    }

    private List<PaymentDashboardResponse.PaymentSnapshot> buildRecentPayments() {
        return paymentRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSnapshot)
                .collect(Collectors.toList());
    }

    private PaymentDashboardResponse.PaymentSnapshot toSnapshot(Payment payment) {
        PaymentDashboardResponse.PaymentSnapshot snapshot = new PaymentDashboardResponse.PaymentSnapshot();
        snapshot.setId(payment.getId());
        snapshot.setAmount(payment.getAmount());
        snapshot.setStatus(payment.getStatus());
        snapshot.setGateway(payment.getGateway());
        snapshot.setCreatedAt(payment.getCreatedAt());
        if (payment.getInvoice() != null) {
            snapshot.setInvoiceNumber(payment.getInvoice().getInvoiceNumber());
            if (payment.getInvoice().getClient() != null) {
                snapshot.setClientName(payment.getInvoice().getClient().getFullName());
            }
            if (payment.getInvoice().getFreelancer() != null) {
                snapshot.setFreelancerName(payment.getInvoice().getFreelancer().getFullName());
            }
        }
        return snapshot;
    }

    private PaymentDashboardResponse.DisputeSummary buildDisputeSummary() {
        PaymentDashboardResponse.DisputeSummary summary = new PaymentDashboardResponse.DisputeSummary();
        summary.setOpen(disputeRepository.countByStatus("OPEN"));
        summary.setInReview(disputeRepository.countByStatus("IN_REVIEW"));
        summary.setResolved(disputeRepository.countByStatus("RESOLVED"));
        summary.setClosed(disputeRepository.countByStatus("CLOSED"));
        summary.setTotal(disputeRepository.count());
        return summary;
    }

    private List<PaymentDashboardResponse.DisputeSnapshot> buildRecentDisputes() {
        return disputeRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDisputeSnapshot)
                .collect(Collectors.toList());
    }

    private PaymentDashboardResponse.DisputeSnapshot toDisputeSnapshot(PaymentDispute dispute) {
        PaymentDashboardResponse.DisputeSnapshot snapshot = new PaymentDashboardResponse.DisputeSnapshot();
        snapshot.setId(dispute.getId());
        snapshot.setStatus(dispute.getStatus());
        snapshot.setDisputeType(dispute.getDisputeType());
        snapshot.setCreatedAt(dispute.getCreatedAt());
        if (dispute.getPayment() != null) {
            snapshot.setPaymentId(dispute.getPayment().getId());
            if (dispute.getPayment().getInvoice() != null) {
                snapshot.setInvoiceNumber(dispute.getPayment().getInvoice().getInvoiceNumber());
            }
        }
        return snapshot;
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return 0L;
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}

