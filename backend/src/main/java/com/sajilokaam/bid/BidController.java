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
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
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
    public ResponseEntity<List<BidResponse>> listBids(@PathVariable Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }
        List<Bid> bids = bidRepository.findByJobId(jobId);
        List<BidResponse> responses = bids.stream().map(bid -> {
            // Initialize lazy-loaded entities by accessing them
            String jobTitle = bid.getJob() != null ? bid.getJob().getTitle() : null;
            Long jobIdValue = bid.getJob() != null ? bid.getJob().getId() : jobId;
            String freelancerName = bid.getFreelancer() != null ? bid.getFreelancer().getFullName() : null;
            String freelancerEmail = bid.getFreelancer() != null ? bid.getFreelancer().getEmail() : null;
            Long freelancerId = bid.getFreelancer() != null ? bid.getFreelancer().getId() : null;
            
            return new BidResponse(
                bid.getId(),
                jobIdValue,
                jobTitle,
                freelancerId,
                freelancerName,
                freelancerEmail,
                bid.getAmount(),
                bid.getMessage(),
                bid.getStatus(),
                bid.getCreatedAt()
            );
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
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

        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }

        Bid bid = new Bid();
        bid.setJob(jobOpt.get());
        bid.setFreelancer(userOpt.get());
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

    @GetMapping("/{jobId}/bids/count")
    public ResponseEntity<Long> getBidCount(@PathVariable Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }
        long count = bidRepository.countByJobId(jobId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{jobId}/bids/compare")
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
}

