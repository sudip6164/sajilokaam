package com.sajilokaam.milestone;

import com.sajilokaam.activitylog.ActivityLogService;
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
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class MilestoneController {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public MilestoneController(MilestoneRepository milestoneRepository, ProjectRepository projectRepository,
                              JwtService jwtService, UserRepository userRepository, ActivityLogService activityLogService) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @GetMapping("/{projectId}/milestones")
    public ResponseEntity<List<Milestone>> getMilestones(@PathVariable Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(milestoneRepository.findByProjectId(projectId));
    }

    @PostMapping("/{projectId}/milestones")
    public ResponseEntity<Milestone> createMilestone(
            @PathVariable Long projectId,
            @RequestBody MilestoneCreateRequest request,
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
        User user = userOpt.get();

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Milestone milestone = new Milestone();
        milestone.setProject(projectOpt.get());
        milestone.setTitle(request.getTitle().trim());
        milestone.setDueDate(request.getDueDate());

        Milestone created = milestoneRepository.save(milestone);
        
        // Log activity
        activityLogService.logActivity(user, "Milestone created", "MILESTONE", created.getId(), 
            "Milestone created: " + created.getTitle());
        
        URI location = URI.create("/api/projects/" + projectId + "/milestones/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<Milestone> updateMilestone(
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
            @RequestBody MilestoneUpdateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Milestone> milestoneOpt = milestoneRepository.findById(milestoneId);
        if (milestoneOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Milestone milestone = milestoneOpt.get();
        if (!milestone.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        String oldTitle = milestone.getTitle();
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            milestone.setTitle(request.getTitle().trim());
        }
        milestone.setDueDate(request.getDueDate());

        Milestone updated = milestoneRepository.save(milestone);
        
        // Log activity
        String changeDesc = oldTitle.equals(updated.getTitle()) 
            ? "Milestone updated: " + updated.getTitle()
            : "Milestone updated: " + oldTitle + " → " + updated.getTitle();
        activityLogService.logActivity(user, "Milestone updated", "MILESTONE", updated.getId(), changeDesc);
        
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
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
        User user = userOpt.get();

        Optional<Milestone> milestoneOpt = milestoneRepository.findById(milestoneId);
        if (milestoneOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Milestone milestone = milestoneOpt.get();
        if (!milestone.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        String milestoneTitle = milestone.getTitle();
        
        // Log deletion activity BEFORE deleting
        activityLogService.logActivity(user, "Milestone deleted", "MILESTONE", milestoneId, 
            "Milestone deleted: " + milestoneTitle);
        
        milestoneRepository.delete(milestone);
        return ResponseEntity.noContent().build();
    }
}

