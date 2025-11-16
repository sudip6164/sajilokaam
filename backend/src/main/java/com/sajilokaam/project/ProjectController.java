package com.sajilokaam.project;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.bid.Bid;
import com.sajilokaam.bid.BidRepository;
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
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final JobRepository jobRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ProjectController(ProjectRepository projectRepository, JobRepository jobRepository,
                            BidRepository bidRepository, UserRepository userRepository,
                            JwtService jwtService) {
        this.projectRepository = projectRepository;
        this.jobRepository = jobRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<Project> list(@RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring("Bearer ".length()).trim();
            Optional<String> emailOpt = jwtService.extractSubject(token);
            if (emailOpt.isPresent()) {
                Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
                if (userOpt.isPresent()) {
                    // Filter projects by user's jobs (if client) or bids (if freelancer)
                    // For now, return all projects
                }
            }
        }
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> get(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/accept-bid/{bidId}")
    public ResponseEntity<Project> acceptBid(
            @PathVariable Long bidId,
            @RequestBody ProjectCreateRequest request,
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
        Job job = bid.getJob();

        // Verify user is the client who owns the job
        if (!job.getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Update bid status to ACCEPTED
        bid.setStatus("ACCEPTED");
        bidRepository.save(bid);

        // Create project
        Project project = new Project();
        project.setJob(job);
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());

        Project created = projectRepository.save(project);
        URI location = URI.create("/api/projects/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(
            @PathVariable Long id,
            @RequestBody ProjectUpdateRequest request,
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

        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = projectOpt.get();
        // Verify user is the client who owns the job associated with the project
        if (project.getJob() == null || !project.getJob().getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            project.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        Project updated = projectRepository.save(project);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
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

        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = projectOpt.get();
        // Verify user is the client who owns the job associated with the project
        if (project.getJob() == null || !project.getJob().getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        projectRepository.delete(project);
        return ResponseEntity.noContent().build();
    }
}

