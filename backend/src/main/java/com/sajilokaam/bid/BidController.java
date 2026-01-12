package com.sajilokaam.bid;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.bid.dto.BidComparisonResponse;
import com.sajilokaam.bid.dto.BidResponse;
import com.sajilokaam.job.Job;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class BidController {

    private final BidRepository bidRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final FreelancerProfileRepository freelancerProfileRepository;

    public BidController(BidRepository bidRepository, JobRepository jobRepository,
                        UserRepository userRepository, JwtService jwtService,
                        FreelancerProfileRepository freelancerProfileRepository) {
        this.bidRepository = bidRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.freelancerProfileRepository = freelancerProfileRepository;
    }

    @GetMapping("/{jobId}/bids")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BidResponse>> listBids(@PathVariable Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }
        List<Bid> bids = bidRepository.findByJobId(jobId);
        List<BidResponse> responses = new ArrayList<>();
        
        // Get job once to avoid multiple queries
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        String jobTitle = jobOpt.map(Job::getTitle).orElse(null);
        
        for (Bid bid : bids) {
            // Access freelancer to initialize it
            User freelancer = bid.getFreelancer();
            String freelancerName = freelancer != null ? freelancer.getFullName() : null;
            String freelancerEmail = freelancer != null ? freelancer.getEmail() : null;
            Long freelancerId = freelancer != null ? freelancer.getId() : null;
            
            responses.add(new BidResponse(
                bid.getId(),
                jobId,
                jobTitle,
                freelancerId,
                freelancerName,
                freelancerEmail,
                bid.getAmount(),
                bid.getMessage(),
                bid.getStatus(),
                bid.getCreatedAt()
            ));
        }
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{jobId}/bids/{bidId}")
    @Transactional(readOnly = true)
    public ResponseEntity<BidResponse> getBid(@PathVariable Long jobId, @PathVariable Long bidId) {
        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty() || !bidOpt.get().getJob().getId().equals(jobId)) {
            return ResponseEntity.notFound().build();
        }
        
        Bid bid = bidOpt.get();
        User freelancer = bid.getFreelancer();
        Job job = bid.getJob();
        
        BidResponse response = new BidResponse(
            bid.getId(),
            job.getId(),
            job.getTitle(),
            freelancer != null ? freelancer.getId() : null,
            freelancer != null ? freelancer.getFullName() : null,
            freelancer != null ? freelancer.getEmail() : null,
            bid.getAmount(),
            bid.getMessage(),
            bid.getStatus(),
            bid.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{jobId}/bids")
    public ResponseEntity<Bid> createBid(
            @PathVariable Long jobId,
            @RequestBody BidCreateRequest request,
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

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Job job = jobOpt.get();
        User currentUser = userOpt.get();

        // Prevent job owner from bidding on their own job
        if (job.getClient() != null && job.getClient().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        // Prevent clients from bidding (only freelancers can bid)
        boolean isClient = currentUser.getRoles().stream()
                .anyMatch(role -> "CLIENT".equalsIgnoreCase(role.getName()));
        if (isClient) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }

        Bid bid = new Bid();
        bid.setJob(job);
        bid.setFreelancer(currentUser);
        bid.setAmount(request.getAmount());
        bid.setMessage(request.getMessage());
        bid.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");

        Bid created = bidRepository.save(bid);
        URI location = URI.create("/api/jobs/" + jobId + "/bids/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/my-bids")
    public ResponseEntity<List<Bid>> getMyBids(
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

        List<Bid> bids = bidRepository.findByFreelancerId(userOpt.get().getId());
        return ResponseEntity.ok(bids);
    }

    @PatchMapping("/{jobId}/bids/{bidId}/reject")
    public ResponseEntity<Bid> rejectBid(
            @PathVariable Long jobId,
            @PathVariable Long bidId,
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

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Bid bid = bidOpt.get();
        if (!bid.getJob().getId().equals(jobId)) {
            return ResponseEntity.badRequest().build();
        }

        // Verify user is the client who owns the job
        if (!bid.getJob().getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        // Only reject if bid is still pending
        if (!bid.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest().build();
        }

        bid.setStatus("REJECTED");
        Bid updated = bidRepository.save(bid);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{jobId}/bids/{bidId}")
    public ResponseEntity<Bid> updateBid(
            @PathVariable Long jobId,
            @PathVariable Long bidId,
            @RequestBody Map<String, Object> updates,
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

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Bid bid = bidOpt.get();
        if (!bid.getJob().getId().equals(jobId)) {
            return ResponseEntity.badRequest().build();
        }

        // Verify user is the freelancer who owns the bid
        if (!bid.getFreelancer().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        // Only allow updates to pending bids
        if (!"PENDING".equals(bid.getStatus())) {
            return ResponseEntity.badRequest().build();
        }

        // Update allowed fields
        if (updates.containsKey("amount")) {
            Object amountObj = updates.get("amount");
            if (amountObj instanceof Number) {
                bid.setAmount(new BigDecimal(amountObj.toString()));
            }
        }
        if (updates.containsKey("message")) {
            bid.setMessage((String) updates.get("message"));
        }

        Bid updated = bidRepository.save(bid);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{jobId}/bids/{bidId}")
    public ResponseEntity<Void> withdrawBid(
            @PathVariable Long jobId,
            @PathVariable Long bidId,
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

        Optional<Bid> bidOpt = bidRepository.findById(bidId);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Bid bid = bidOpt.get();
        if (!bid.getJob().getId().equals(jobId)) {
            return ResponseEntity.badRequest().build();
        }

        // Verify user is the freelancer who created the bid
        if (!bid.getFreelancer().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        // Only allow withdrawal if bid is still pending
        if (!bid.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest().build();
        }

        bidRepository.delete(bid);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{jobId}/bids/count")
    public ResponseEntity<Long> getBidCount(@PathVariable Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }
        long count = bidRepository.countByJobId(jobId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{jobId}/bids/compare")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BidComparisonResponse>> compareBids(
            @PathVariable Long jobId,
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

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Verify user is the client who owns the job
        if (!jobOpt.get().getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        // Get all bids for this job, sorted by amount (ascending)
        List<Bid> bids = bidRepository.findByJobId(jobId);
        bids.sort((b1, b2) -> b1.getAmount().compareTo(b2.getAmount()));
        
        // Enrich with freelancer profile data
        List<BidComparisonResponse> comparisons = new ArrayList<>();
        for (Bid bid : bids) {
            User freelancer = bid.getFreelancer();
            Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(freelancer.getId());
            
            String experienceLevel = null;
            if (profileOpt.isPresent() && profileOpt.get().getExperienceLevel() != null) {
                experienceLevel = profileOpt.get().getExperienceLevel().name();
            }
            
            BidComparisonResponse response = new BidComparisonResponse(
                bid.getId(),
                freelancer.getId(),
                freelancer.getFullName(),
                freelancer.getEmail(),
                bid.getAmount(),
                bid.getMessage(),
                bid.getStatus(),
                bid.getCreatedAt(),
                experienceLevel,
                null // Rating not implemented yet
            );
            comparisons.add(response);
        }
        
        return ResponseEntity.ok(comparisons);
    }

    @GetMapping("/bids/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<BidResponse> getBidById(@PathVariable Long id) {
        Optional<Bid> bidOpt = bidRepository.findById(id);
        if (bidOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Bid bid = bidOpt.get();
        
        // Access job and freelancer to initialize them
        Job job = bid.getJob();
        User freelancer = bid.getFreelancer();
        
        Long jobId = job != null ? job.getId() : null;
        String jobTitle = job != null ? job.getTitle() : null;
        String freelancerName = freelancer != null ? freelancer.getFullName() : null;
        String freelancerEmail = freelancer != null ? freelancer.getEmail() : null;
        Long freelancerId = freelancer != null ? freelancer.getId() : null;

        return ResponseEntity.ok(new BidResponse(
            bid.getId(),
            jobId,
            jobTitle,
            freelancerId,
            freelancerName,
            freelancerEmail,
            bid.getAmount(),
            bid.getMessage(),
            bid.getStatus(),
            bid.getCreatedAt()
        ));
    }
}

