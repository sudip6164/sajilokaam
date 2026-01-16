package com.sajilokaam.review;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ReviewController(ReviewRepository reviewRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository,
                           JwtService jwtService) {
        this.reviewRepository = reviewRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Review>> getProjectReviews(@PathVariable Long projectId) {
        List<Review> reviews = reviewRepository.findByProjectId(projectId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        try {
            System.out.println("ReviewController: getUserReviews called with userId=" + userId);
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            List<Review> reviews = reviewRepository.findByRevieweeId(userId);
            System.out.println("ReviewController: Found " + (reviews != null ? reviews.size() : 0) + " reviews");
            return ResponseEntity.ok(reviews != null ? reviews : new java.util.ArrayList<>());
        } catch (Exception e) {
            System.err.println("ReviewController: Error in getUserReviews: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("ReviewController is working!");
    }

    @PostMapping
    public ResponseEntity<Review> createReview(
            @RequestBody ReviewCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> reviewerOpt = userRepository.findByEmail(emailOpt.get());
        if (reviewerOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Long revieweeId = request.getRevieweeId();
        System.out.println("ReviewController: Creating review - Reviewer ID: " + reviewerOpt.get().getId() + 
                          " (" + reviewerOpt.get().getEmail() + "), Reviewee ID requested: " + revieweeId);
        
        Optional<User> revieweeOpt = userRepository.findById(revieweeId);
        if (revieweeOpt.isEmpty()) {
            System.err.println("ReviewController: ERROR - Reviewee not found with ID: " + revieweeId);
            return ResponseEntity.notFound().build();
        }
        
        System.out.println("ReviewController: Reviewee found - ID: " + revieweeOpt.get().getId() + 
                          " (" + revieweeOpt.get().getEmail() + ")");

        // Project is optional - if provided, validate it exists
        Project project = null;
        if (request.getProjectId() != null && request.getProjectId() > 0) {
            Optional<Project> projectOpt = projectRepository.findById(request.getProjectId());
            if (projectOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            project = projectOpt.get();
            
            // Check if review already exists for this project
            Optional<Review> existing = reviewRepository.findByProjectIdAndReviewerId(
                request.getProjectId(), reviewerOpt.get().getId());
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(null);
            }
        } else {
            // For reviews without projects, check if user already reviewed this person
            List<Review> existingReviews = reviewRepository.findByReviewerId(reviewerOpt.get().getId());
            boolean alreadyReviewed = existingReviews.stream()
                .anyMatch(r -> r.getReviewee().getId().equals(request.getRevieweeId()) && r.getProject() == null);
            if (alreadyReviewed) {
                return ResponseEntity.badRequest().body(null);
            }
        }

        Review review = new Review();
        review.setProject(project);
        review.setReviewer(reviewerOpt.get());
        review.setReviewee(revieweeOpt.get());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        URI location = URI.create("/api/reviews/" + saved.getId());
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReview(@PathVariable Long id) {
        return reviewRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestBody ReviewUpdateRequest request,
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

        Optional<Review> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Review review = reviewOpt.get();
        // Only the reviewer can update their own review
        if (!review.getReviewer().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        // Update fields if provided
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            review.setTitle(request.getTitle().trim());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment().trim());
        }
        review.setUpdatedAt(java.time.Instant.now());

        Review updated = reviewRepository.save(review);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
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

        Optional<Review> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Review review = reviewOpt.get();
        // Only the reviewer can delete their own review
        if (!review.getReviewer().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        reviewRepository.delete(review);
        return ResponseEntity.noContent().build();
    }

    public static class ReviewCreateRequest {
        private Long projectId;
        private Long revieweeId;
        private Integer rating;
        private String title;
        private String comment;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }

        public Long getRevieweeId() { return revieweeId; }
        public void setRevieweeId(Long revieweeId) { this.revieweeId = revieweeId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ReviewUpdateRequest {
        private Integer rating;
        private String title;
        private String comment;

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }
}
