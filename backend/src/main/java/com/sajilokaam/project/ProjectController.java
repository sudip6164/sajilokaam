package com.sajilokaam.project;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.bid.Bid;
import com.sajilokaam.bid.BidRepository;
import com.sajilokaam.conversation.Conversation;
import com.sajilokaam.conversation.ConversationRepository;
import com.sajilokaam.job.Job;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final JobRepository jobRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ConversationRepository conversationRepository;

    public ProjectController(ProjectRepository projectRepository, JobRepository jobRepository,
                            BidRepository bidRepository, UserRepository userRepository,
                            JwtService jwtService, ConversationRepository conversationRepository) {
        this.projectRepository = projectRepository;
        this.jobRepository = jobRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.conversationRepository = conversationRepository;
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
    public ResponseEntity<Project> get(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Project project = projectOpt.get();
        
        // If authorization is provided, verify the user has access to the project
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring("Bearer ".length()).trim();
            Optional<String> emailOpt = jwtService.extractSubject(token);
            if (emailOpt.isPresent()) {
                Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    // Check if user is the client or freelancer for this project
                    Job job = project.getJob();
                    boolean isClient = job != null && job.getClient() != null && job.getClient().getId().equals(user.getId());
                    
                    // Check if user is the freelancer (from accepted bid)
                    boolean isFreelancer = false;
                    if (job != null) {
                        List<Bid> bids = bidRepository.findByJobId(job.getId());
                        for (Bid bid : bids) {
                            if ("ACCEPTED".equals(bid.getStatus()) && 
                                bid.getFreelancer() != null && 
                                bid.getFreelancer().getId().equals(user.getId())) {
                                isFreelancer = true;
                                break;
                            }
                        }
                    }
                    
                    boolean isAdmin = user.getRoles().stream()
                            .anyMatch(role -> role.getName().equals("ADMIN"));
                    
                    if (!isClient && !isFreelancer && !isAdmin) {
                        return ResponseEntity.status(403).build();
                    }
                }
            }
        }
        
        return ResponseEntity.ok(project);
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

        // Reject all other pending bids for this job
        List<Bid> otherBids = bidRepository.findByJobId(job.getId());
        for (Bid otherBid : otherBids) {
            if (!otherBid.getId().equals(bidId) && "PENDING".equals(otherBid.getStatus())) {
                otherBid.setStatus("REJECTED");
                bidRepository.save(otherBid);
            }
        }

        // Create project with freelancer and client associated
        Project project = new Project();
        project.setJob(job);
        project.setFreelancer(bid.getFreelancer());
        project.setClient(job.getClient());
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setBudget(bid.getAmount());
        project.setStatus("ACTIVE");

        Project created = projectRepository.save(project);
        
        // Automatically create a conversation for this project
        try {
            Conversation conversation = new Conversation();
            conversation.setProject(created);
            conversation.setTitle("Project: " + created.getTitle());
            
            // Add both client and freelancer as participants
            Set<User> participants = new HashSet<>();
            participants.add(job.getClient());
            participants.add(bid.getFreelancer());
            conversation.setParticipants(participants);
            
            conversationRepository.save(conversation);
        } catch (Exception e) {
            // Log error but don't fail the project creation
            System.err.println("Failed to create conversation for project " + created.getId() + ": " + e.getMessage());
        }
        
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

