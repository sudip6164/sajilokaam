package com.sajilokaam.bid;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.bid.dto.BidResponse;
import com.sajilokaam.job.Job;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "http://localhost:5173")
public class BidQueryController {
    private final BidRepository bidRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public BidQueryController(BidRepository bidRepository, JwtService jwtService, UserRepository userRepository) {
        this.bidRepository = bidRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<BidResponse>> getBids(
            @RequestParam(required = false) Long freelancerId,
            @RequestParam(required = false) String status,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        List<Bid> bids;
        
        if (freelancerId != null) {
            bids = bidRepository.findByFreelancerId(freelancerId);
        } else if (authorization != null && authorization.startsWith("Bearer ")) {
            // Get bids for authenticated user
            String token = authorization.substring("Bearer ".length()).trim();
            Optional<String> emailOpt = jwtService.extractSubject(token);
            if (emailOpt.isPresent()) {
                Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
                if (userOpt.isPresent()) {
                    bids = bidRepository.findByFreelancerId(userOpt.get().getId());
                } else {
                    bids = new ArrayList<>();
                }
            } else {
                bids = new ArrayList<>();
            }
        } else {
            return ResponseEntity.status(401).build();
        }
        
        // Filter by status if provided
        if (status != null && !status.isBlank()) {
            bids = bids.stream()
                    .filter(bid -> status.equalsIgnoreCase(bid.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        // Convert to BidResponse
        List<BidResponse> responses = new ArrayList<>();
        for (Bid bid : bids) {
            User freelancer = bid.getFreelancer();
            Job job = bid.getJob();
            responses.add(new BidResponse(
                bid.getId(),
                job != null ? job.getId() : null,
                job != null ? job.getTitle() : null,
                freelancer != null ? freelancer.getId() : null,
                freelancer != null ? freelancer.getFullName() : null,
                freelancer != null ? freelancer.getEmail() : null,
                bid.getAmount(),
                bid.getMessage(),
                bid.getStatus(),
                bid.getCreatedAt()
            ));
        }
        
        return ResponseEntity.ok(responses);
    }
}

