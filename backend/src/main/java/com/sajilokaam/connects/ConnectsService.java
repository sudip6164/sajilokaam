package com.sajilokaam.connects;

import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import com.sajilokaam.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ConnectsService {
    
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ConnectTransactionRepository connectTransactionRepository;
    
    public ConnectsService(
            FreelancerProfileRepository freelancerProfileRepository,
            ConnectTransactionRepository connectTransactionRepository) {
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.connectTransactionRepository = connectTransactionRepository;
    }
    
    /**
     * Check if user has enough connects
     */
    public boolean hasEnoughConnects(Long userId, int required) {
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return false;
        }
        
        FreelancerProfile profile = profileOpt.get();
        Integer available = profile.getConnectsAvailable();
        return available != null && available >= required;
    }
    
    /**
     * Spend connects (for submitting bid)
     */
    @Transactional
    public boolean spendConnects(User user, int amount, Long bidId, String description) {
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(user.getId());
        if (profileOpt.isEmpty()) {
            return false;
        }
        
        FreelancerProfile profile = profileOpt.get();
        Integer available = profile.getConnectsAvailable();
        
        if (available == null || available < amount) {
            return false;
        }
        
        // Deduct connects
        int newBalance = available - amount;
        profile.setConnectsAvailable(newBalance);
        freelancerProfileRepository.save(profile);
        
        // Record transaction
        ConnectTransaction transaction = new ConnectTransaction();
        transaction.setUser(user);
        transaction.setAmount(-amount); // Negative for spending
        transaction.setType(ConnectTransactionType.SPENT);
        transaction.setReferenceId(bidId);
        transaction.setReferenceType("bid");
        transaction.setDescription(description);
        transaction.setBalanceAfter(newBalance);
        connectTransactionRepository.save(transaction);
        
        return true;
    }
    
    /**
     * Refund connects (when bid is withdrawn or rejected)
     */
    @Transactional
    public void refundConnects(User user, int amount, Long bidId, String reason) {
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(user.getId());
        if (profileOpt.isEmpty()) {
            return;
        }
        
        FreelancerProfile profile = profileOpt.get();
        Integer available = profile.getConnectsAvailable();
        int newBalance = (available != null ? available : 0) + amount;
        
        profile.setConnectsAvailable(newBalance);
        freelancerProfileRepository.save(profile);
        
        // Record transaction
        ConnectTransaction transaction = new ConnectTransaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setType(ConnectTransactionType.REFUND);
        transaction.setReferenceId(bidId);
        transaction.setReferenceType("bid");
        transaction.setDescription(reason);
        transaction.setBalanceAfter(newBalance);
        connectTransactionRepository.save(transaction);
    }
    
    /**
     * Purchase connects
     */
    @Transactional
    public void purchaseConnects(User user, int amount, String paymentReference) {
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(user.getId());
        if (profileOpt.isEmpty()) {
            return;
        }
        
        FreelancerProfile profile = profileOpt.get();
        Integer available = profile.getConnectsAvailable();
        Integer totalPurchased = profile.getConnectsTotalPurchased();
        
        int newBalance = (available != null ? available : 0) + amount;
        int newTotal = (totalPurchased != null ? totalPurchased : 0) + amount;
        
        profile.setConnectsAvailable(newBalance);
        profile.setConnectsTotalPurchased(newTotal);
        freelancerProfileRepository.save(profile);
        
        // Record transaction
        ConnectTransaction transaction = new ConnectTransaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setType(ConnectTransactionType.PURCHASE);
        transaction.setDescription("Purchased " + amount + " connects");
        transaction.setBalanceAfter(newBalance);
        connectTransactionRepository.save(transaction);
    }
    
    /**
     * Get current connects balance
     */
    public int getConnectsBalance(Long userId) {
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return 0;
        }
        
        Integer available = profileOpt.get().getConnectsAvailable();
        return available != null ? available : 0;
    }
}
