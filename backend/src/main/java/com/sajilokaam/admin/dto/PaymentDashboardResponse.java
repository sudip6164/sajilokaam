package com.sajilokaam.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class PaymentDashboardResponse {
    private PaymentSummary summary;
    private List<GatewayBreakdown> gateways;
    private List<StatusBreakdown> statuses;
    private DisputeSummary disputes;
    private List<PaymentSnapshot> recentPayments;
    private List<DisputeSnapshot> recentDisputes;

    public PaymentSummary getSummary() {
        return summary;
    }

    public void setSummary(PaymentSummary summary) {
        this.summary = summary;
    }

    public List<GatewayBreakdown> getGateways() {
        return gateways;
    }

    public void setGateways(List<GatewayBreakdown> gateways) {
        this.gateways = gateways;
    }

    public List<StatusBreakdown> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<StatusBreakdown> statuses) {
        this.statuses = statuses;
    }

    public DisputeSummary getDisputes() {
        return disputes;
    }

    public void setDisputes(DisputeSummary disputes) {
        this.disputes = disputes;
    }

    public List<PaymentSnapshot> getRecentPayments() {
        return recentPayments;
    }

    public void setRecentPayments(List<PaymentSnapshot> recentPayments) {
        this.recentPayments = recentPayments;
    }

    public List<DisputeSnapshot> getRecentDisputes() {
        return recentDisputes;
    }

    public void setRecentDisputes(List<DisputeSnapshot> recentDisputes) {
        this.recentDisputes = recentDisputes;
    }

    public static class PaymentSummary {
        private BigDecimal totalCollected;
        private BigDecimal pendingAmount;
        private BigDecimal refundedAmount;
        private BigDecimal averageTicketSize;
        private long totalTransactions;

        public BigDecimal getTotalCollected() {
            return totalCollected;
        }

        public void setTotalCollected(BigDecimal totalCollected) {
            this.totalCollected = totalCollected;
        }

        public BigDecimal getPendingAmount() {
            return pendingAmount;
        }

        public void setPendingAmount(BigDecimal pendingAmount) {
            this.pendingAmount = pendingAmount;
        }

        public BigDecimal getRefundedAmount() {
            return refundedAmount;
        }

        public void setRefundedAmount(BigDecimal refundedAmount) {
            this.refundedAmount = refundedAmount;
        }

        public BigDecimal getAverageTicketSize() {
            return averageTicketSize;
        }

        public void setAverageTicketSize(BigDecimal averageTicketSize) {
            this.averageTicketSize = averageTicketSize;
        }

        public long getTotalTransactions() {
            return totalTransactions;
        }

        public void setTotalTransactions(long totalTransactions) {
            this.totalTransactions = totalTransactions;
        }
    }

    public static class GatewayBreakdown {
        private String gateway;
        private long count;
        private BigDecimal totalAmount;

        public String getGateway() {
            return gateway;
        }

        public void setGateway(String gateway) {
            this.gateway = gateway;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }
    }

    public static class StatusBreakdown {
        private String status;
        private long count;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    public static class DisputeSummary {
        private long open;
        private long inReview;
        private long resolved;
        private long closed;
        private long total;

        public long getOpen() {
            return open;
        }

        public void setOpen(long open) {
            this.open = open;
        }

        public long getInReview() {
            return inReview;
        }

        public void setInReview(long inReview) {
            this.inReview = inReview;
        }

        public long getResolved() {
            return resolved;
        }

        public void setResolved(long resolved) {
            this.resolved = resolved;
        }

        public long getClosed() {
            return closed;
        }

        public void setClosed(long closed) {
            this.closed = closed;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }
    }

    public static class PaymentSnapshot {
        private Long id;
        private String invoiceNumber;
        private String clientName;
        private String freelancerName;
        private String status;
        private String gateway;
        private BigDecimal amount;
        private Instant createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getInvoiceNumber() {
            return invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }

        public String getClientName() {
            return clientName;
        }

        public void setClientName(String clientName) {
            this.clientName = clientName;
        }

        public String getFreelancerName() {
            return freelancerName;
        }

        public void setFreelancerName(String freelancerName) {
            this.freelancerName = freelancerName;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getGateway() {
            return gateway;
        }

        public void setGateway(String gateway) {
            this.gateway = gateway;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }

    public static class DisputeSnapshot {
        private Long id;
        private Long paymentId;
        private String invoiceNumber;
        private String disputeType;
        private String status;
        private Instant createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(Long paymentId) {
            this.paymentId = paymentId;
        }

        public String getInvoiceNumber() {
            return invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }

        public String getDisputeType() {
            return disputeType;
        }

        public void setDisputeType(String disputeType) {
            this.disputeType = disputeType;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}

