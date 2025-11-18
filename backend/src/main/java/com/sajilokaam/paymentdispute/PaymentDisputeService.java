package com.sajilokaam.paymentdispute;

import com.sajilokaam.payment.Payment;
import com.sajilokaam.payment.PaymentRepository;
import com.sajilokaam.paymentdispute.dto.PaymentDisputeRequest;
import com.sajilokaam.paymentdispute.dto.PaymentDisputeResolutionRequest;
import com.sajilokaam.paymentdispute.dto.PaymentDisputeResponse;
import com.sajilokaam.user.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class PaymentDisputeService {

    private final PaymentDisputeRepository disputeRepository;
    private final PaymentRepository paymentRepository;

    public PaymentDisputeService(PaymentDisputeRepository disputeRepository,
                                 PaymentRepository paymentRepository) {
        this.disputeRepository = disputeRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<PaymentDisputeResponse> getDisputesForUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return disputeRepository.findByRaisedById(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentDisputeResponse> getAllDisputes() {
        return disputeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentDisputeResponse> getDisputesForPayment(Long paymentId, User user) {
        List<PaymentDispute> disputes = disputeRepository.findByPaymentId(paymentId);
        return disputes.stream()
                .filter(dispute -> canView(dispute, user))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PaymentDisputeResponse raiseDispute(Long paymentId, PaymentDisputeRequest request, User user) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if (!canRaise(payment, user)) {
            throw new IllegalStateException("You are not allowed to dispute this payment");
        }
        PaymentDispute dispute = new PaymentDispute();
        dispute.setPayment(payment);
        dispute.setRaisedBy(user);
        dispute.setDisputeType(request.getDisputeType());
        dispute.setReason(request.getReason());
        dispute.setStatus("OPEN");
        dispute.setCreatedAt(Instant.now());
        dispute.setUpdatedAt(Instant.now());
        return toResponse(disputeRepository.save(dispute));
    }

    public PaymentDisputeResponse resolveDispute(Long disputeId, PaymentDisputeResolutionRequest request, User resolver) {
        PaymentDispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found"));
        dispute.setStatus(request.getStatus());
        dispute.setResolution(request.getResolution());
        dispute.setResolvedBy(resolver);
        dispute.setResolvedAt(Instant.now());
        dispute.setUpdatedAt(Instant.now());
        return toResponse(disputeRepository.save(dispute));
    }

    @SuppressWarnings("null")
    private boolean canView(PaymentDispute dispute, User user) {
        if (user == null || user.getId() == null) return false;
        Long userId = user.getId();
        if (userId == null) {
            return false;
        }
        if (dispute.getRaisedBy() != null) {
            Long raisedById = dispute.getRaisedBy().getId();
            if (raisedById != null && raisedById.equals(userId)) {
                return true;
            }
        }
        if (dispute.getPayment() == null || dispute.getPayment().getInvoice() == null) {
            return false;
        }
        Long clientId = dispute.getPayment().getInvoice().getClient() != null
                ? dispute.getPayment().getInvoice().getClient().getId()
                : null;
        Long freelancerId = dispute.getPayment().getInvoice().getFreelancer() != null
                ? dispute.getPayment().getInvoice().getFreelancer().getId()
                : null;
        if (clientId != null && clientId.equals(userId)) {
            return true;
        }
        return freelancerId != null && freelancerId.equals(userId);
    }

    @SuppressWarnings("null")
    private boolean canRaise(Payment payment, User user) {
        if (payment == null || payment.getInvoice() == null || user == null || user.getId() == null) {
            return false;
        }
        Long userId = user.getId();
        if (userId == null) {
            return false;
        }
        Long clientId = payment.getInvoice().getClient() != null ? payment.getInvoice().getClient().getId() : null;
        Long freelancerId = payment.getInvoice().getFreelancer() != null ? payment.getInvoice().getFreelancer().getId() : null;
        if (clientId != null && clientId.equals(userId)) {
            return true;
        }
        return freelancerId != null && freelancerId.equals(userId);
    }

    private PaymentDisputeResponse toResponse(PaymentDispute dispute) {
        PaymentDisputeResponse response = new PaymentDisputeResponse();
        response.setId(dispute.getId());
        if (dispute.getPayment() != null) {
            response.setPaymentId(dispute.getPayment().getId());
            if (dispute.getPayment().getInvoice() != null) {
                response.setInvoiceNumber(dispute.getPayment().getInvoice().getInvoiceNumber());
                response.setAmount(dispute.getPayment().getAmount() != null ? dispute.getPayment().getAmount().doubleValue() : null);
            }
            response.setGateway(dispute.getPayment().getGateway());
        }
        response.setDisputeType(dispute.getDisputeType());
        response.setReason(dispute.getReason());
        response.setStatus(dispute.getStatus());
        response.setResolution(dispute.getResolution());
        response.setCreatedAt(dispute.getCreatedAt());
        response.setResolvedAt(dispute.getResolvedAt());

        if (dispute.getRaisedBy() != null) {
            PaymentDisputeResponse.UserSummary summary = new PaymentDisputeResponse.UserSummary();
            summary.setId(dispute.getRaisedBy().getId());
            summary.setFullName(dispute.getRaisedBy().getFullName());
            summary.setEmail(dispute.getRaisedBy().getEmail());
            response.setRaisedBy(summary);
        }
        if (dispute.getResolvedBy() != null) {
            PaymentDisputeResponse.UserSummary summary = new PaymentDisputeResponse.UserSummary();
            summary.setId(dispute.getResolvedBy().getId());
            summary.setFullName(dispute.getResolvedBy().getFullName());
            summary.setEmail(dispute.getResolvedBy().getEmail());
            response.setResolvedBy(summary);
        }
        return response;
    }
}

