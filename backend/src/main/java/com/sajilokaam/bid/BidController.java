package com.sajilokaam.bid;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.job.Job;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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

    public BidController(BidRepository bidRepository, JobRepository jobRepository,
                        UserRepository userRepository, JwtService jwtService) {
        this.bidRepository = bidRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/{jobId}/bids")
    public ResponseEntity<List<Bid>> listBids(@PathVariable Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bidRepository.findByJobId(jobId));
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
}

