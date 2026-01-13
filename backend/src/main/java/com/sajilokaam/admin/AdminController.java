package com.sajilokaam.admin;

import com.sajilokaam.auth.RequiresAdmin;
import com.sajilokaam.profile.ClientProfile;
import com.sajilokaam.profile.ClientProfileRepository;
import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import com.sajilokaam.profile.ProfileStatus;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import com.sajilokaam.role.Role;
import com.sajilokaam.role.RoleRepository;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.bid.BidRepository;
import com.sajilokaam.project.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private FreelancerProfileRepository freelancerProfileRepository;

    @Autowired
    private ClientProfileRepository clientProfileRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Analytics Endpoints
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalFreelancers", freelancerProfileRepository.count());
        analytics.put("totalClients", clientProfileRepository.count());
        analytics.put("activeJobs", jobRepository.countByStatus("OPEN"));
        analytics.put("pendingVerifications", 
            freelancerProfileRepository.countByStatus(ProfileStatus.SUBMITTED) + 
            clientProfileRepository.countByStatus(ProfileStatus.SUBMITTED));
        analytics.put("approvedProfiles",
            freelancerProfileRepository.countByStatus(ProfileStatus.APPROVED) + 
            clientProfileRepository.countByStatus(ProfileStatus.APPROVED));
        analytics.put("rejectedProfiles",
            freelancerProfileRepository.countByStatus(ProfileStatus.REJECTED) + 
            clientProfileRepository.countByStatus(ProfileStatus.REJECTED));
        analytics.put("totalRevenue", 0);
        
        return ResponseEntity.ok(analytics);
    }

    // User Management Endpoints
    @GetMapping("/users/freelancers")
    public ResponseEntity<?> getFreelancers() {
        Role freelancerRole = roleRepository.findByName("FREELANCER")
                .orElseThrow(() -> new RuntimeException("Freelancer role not found"));
        
        List<User> freelancers = userRepository.findByRolesContaining(freelancerRole);
        
        List<Map<String, Object>> result = freelancers.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("fullName", user.getFullName());
            userMap.put("createdAt", user.getCreatedAt());
            userMap.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");
            
            // Get freelancer profile
            FreelancerProfile profile = freelancerProfileRepository.findByUserId(user.getId())
                    .orElse(null);
            userMap.put("profile", profile);
            
            return userMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/clients")
    public ResponseEntity<?> getClients() {
        Role clientRole = roleRepository.findByName("CLIENT")
                .orElseThrow(() -> new RuntimeException("Client role not found"));
        
        List<User> clients = userRepository.findByRolesContaining(clientRole);
        
        List<Map<String, Object>> result = clients.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("fullName", user.getFullName());
            userMap.put("createdAt", user.getCreatedAt());
            userMap.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");
            
            // Get client profile
            ClientProfile profile = clientProfileRepository.findByUserId(user.getId())
                    .orElse(null);
            userMap.put("profile", profile);
            
            return userMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/admins")
    public ResponseEntity<?> getAdmins() {
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
        
        List<User> admins = userRepository.findByRolesContaining(adminRole);
        
        List<Map<String, Object>> result = admins.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("fullName", user.getFullName());
            userMap.put("createdAt", user.getCreatedAt());
            userMap.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");
            
            return userMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String status = request.get("status");
        user.setStatus(status);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete associated profiles
        freelancerProfileRepository.deleteByUserId(userId);
        clientProfileRepository.deleteByUserId(userId);
        
        // Delete user
        userRepository.delete(user);
        
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Verification Queue Endpoints
    @GetMapping("/profiles/freelancers/pending")
    public ResponseEntity<?> getPendingFreelancers() {
        List<FreelancerProfile> pendingProfiles = freelancerProfileRepository.findByStatus(ProfileStatus.SUBMITTED);
        
        List<Map<String, Object>> result = pendingProfiles.stream().map(profile -> {
            User user = profile.getUser();
            
            Map<String, Object> profileMap = new HashMap<>();
            profileMap.put("id", user != null ? user.getId() : null);
            profileMap.put("email", user != null ? user.getEmail() : null);
            profileMap.put("fullName", user != null ? user.getFullName() : null);
            profileMap.put("createdAt", user != null ? user.getCreatedAt() : null);
            profileMap.put("profile", profile);
            
            return profileMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profiles/clients/pending")
    public ResponseEntity<?> getPendingClients() {
        List<ClientProfile> pendingProfiles = clientProfileRepository.findByStatus(ProfileStatus.SUBMITTED);
        
        List<Map<String, Object>> result = pendingProfiles.stream().map(profile -> {
            User user = profile.getUser();
            
            Map<String, Object> profileMap = new HashMap<>();
            profileMap.put("id", user != null ? user.getId() : null);
            profileMap.put("email", user != null ? user.getEmail() : null);
            profileMap.put("fullName", user != null ? user.getFullName() : null);
            profileMap.put("createdAt", user != null ? user.getCreatedAt() : null);
            profileMap.put("profile", profile);
            
            return profileMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/profiles/freelancers/{profileId}/verification")
    public ResponseEntity<?> updateFreelancerVerification(
            @PathVariable Long profileId,
            @RequestBody Map<String, String> request) {
        
        // Find user by ID (profileId is actually userId from frontend)
        User user = userRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FreelancerProfile profile = freelancerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Freelancer profile not found"));
        
        String status = request.get("status");
        String notes = request.get("notes");
        
        profile.setStatus(ProfileStatus.valueOf(status));
        if ("REJECTED".equals(status)) {
            profile.setRejectionReason(notes);
        } else if ("NEEDS_UPDATE".equals(status)) {
            profile.setVerificationNotes(notes);
        } else if ("APPROVED".equals(status)) {
            profile.setVerificationNotes(notes);
        }
        
        freelancerProfileRepository.save(profile);
        
        return ResponseEntity.ok(Map.of("message", "Verification updated successfully"));
    }

    @PatchMapping("/profiles/clients/{profileId}/verification")
    public ResponseEntity<?> updateClientVerification(
            @PathVariable Long profileId,
            @RequestBody Map<String, String> request) {
        
        // Find user by ID (profileId is actually userId from frontend)
        User user = userRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ClientProfile profile = clientProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Client profile not found"));
        
        String status = request.get("status");
        String notes = request.get("notes");
        
        profile.setStatus(ProfileStatus.valueOf(status));
        if ("REJECTED".equals(status)) {
            profile.setRejectionReason(notes);
        } else if ("NEEDS_UPDATE".equals(status)) {
            profile.setVerificationNotes(notes);
        } else if ("APPROVED".equals(status)) {
            profile.setVerificationNotes(notes);
        }
        
        clientProfileRepository.save(profile);
        
        return ResponseEntity.ok(Map.of("message", "Verification updated successfully"));
    }
}
