package com.sajilokaam.auth;

import com.sajilokaam.role.Role;
import com.sajilokaam.role.RoleRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import com.sajilokaam.util.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, JwtService jwtService, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank() ||
            request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(409).build(); // Conflict
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        // Assign role: CLIENT or FREELANCER (default to FREELANCER)
        String roleName = (request.getRole() != null && request.getRole().equals("CLIENT")) ? "CLIENT" : "FREELANCER";
        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(roleName + " role not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        // Email is verified by default (no verification required)
        user.setEmailVerified(true);

        User created = userRepository.save(user);

        // Auto-login: generate token
        String token = jwtService.generateToken(created.getId(), created.getEmail());
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(new LoginResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            System.err.println("Login failed: User not found for email: " + request.getEmail());
            return ResponseEntity.status(401).build();
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordMatches) {
            System.err.println("Login failed: Password mismatch for user: " + request.getEmail());
            System.err.println("Stored hash starts with: " + (user.getPassword() != null ? user.getPassword().substring(0, Math.min(20, user.getPassword().length())) : "null"));
            return ResponseEntity.status(401).build();
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> me(@RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authorization.substring("Bearer ".length()).trim();
        var subjectOpt = jwtService.extractSubject(token);
        if (subjectOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        String email = subjectOpt.get();
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        var u = userOpt.get();
        return ResponseEntity.ok(new UserProfile(u.getId(), u.getEmail(), u.getFullName(), u.getRoles()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateProfile(
            @RequestBody UserUpdateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authorization.substring("Bearer ".length()).trim();
        var subjectOpt = jwtService.extractSubject(token);
        if (subjectOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        String email = subjectOpt.get();
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        var u = userOpt.get();

        // Update full name if provided
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            u.setFullName(request.getFullName());
        }

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            // Verify current password if provided
            if (request.getCurrentPassword() != null && !request.getCurrentPassword().isBlank()) {
                boolean currentPasswordMatches = passwordEncoder.matches(request.getCurrentPassword(), u.getPassword());
                if (!currentPasswordMatches) {
                    return ResponseEntity.status(401).build(); // Unauthorized - wrong current password
                }
            }
            
            if (request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().build();
            }
            u.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(u);
        return ResponseEntity.ok(new UserProfile(updated.getId(), updated.getEmail(), updated.getFullName(), updated.getRoles()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        var userOpt = userRepository.findByEmail(email);
        // For security, don't reveal if email exists or not
        // Always return success message
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Generate reset token (UUID)
            String resetToken = UUID.randomUUID().toString();
            // Token expires in 1 hour
            Instant expiresAt = Instant.now().plusSeconds(3600);
            
            user.setResetToken(resetToken);
            user.setResetTokenExpiresAt(expiresAt);
            userRepository.save(user);
            
            // Send email with reset link
            try {
                emailService.sendPasswordResetEmail(email, resetToken);
                System.out.println("Password reset request processed for: " + email);
            } catch (Exception e) {
                System.err.println("Failed to send password reset email: " + e.getMessage());
                e.printStackTrace();
                // Log error but don't fail the request - user still gets success message
                // In production, you might want to queue this for retry
                // Token is still saved, so user can check console logs for the reset link
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account exists with this email, you will receive password reset instructions.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        
        if (token == null || token.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (password.length() < 6) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(error);
        }

        // Find user by reset token
        var users = userRepository.findAll();
        User user = null;
        for (User u : users) {
            if (token.equals(u.getResetToken()) && 
                u.getResetTokenExpiresAt() != null && 
                u.getResetTokenExpiresAt().isAfter(Instant.now())) {
                user = u;
                break;
            }
        }

        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid or expired reset token");
            return ResponseEntity.status(400).body(error);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(password));
        // Clear reset token
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isBlank()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Verification token is required");
            return ResponseEntity.badRequest().body(error);
        }

        // Find user by verification token
        var users = userRepository.findAll();
        User user = null;
        for (User u : users) {
            if (token.equals(u.getVerificationToken()) && 
                u.getVerificationTokenExpiresAt() != null && 
                u.getVerificationTokenExpiresAt().isAfter(Instant.now())) {
                user = u;
                break;
            }
        }

        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid or expired verification token");
            return ResponseEntity.status(400).body(error);
        }

        // Check if already verified
        if (user.getEmailVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email is already verified");
            return ResponseEntity.ok(response);
        }

        // Verify email
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, don't reveal if email exists
            Map<String, String> response = new HashMap<>();
            response.put("message", "If an account exists with this email, you will receive a verification email.");
            return ResponseEntity.ok(response);
        }

        User user = userOpt.get();
        
        // Check if already verified
        if (user.getEmailVerified()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email is already verified");
            return ResponseEntity.ok(response);
        }

        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        Instant verificationExpiresAt = Instant.now().plusSeconds(86400); // 24 hours
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiresAt(verificationExpiresAt);
        userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(email, verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send verification email. Please try again later.");
            return ResponseEntity.status(500).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Verification email sent successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authorization.substring("Bearer ".length()).trim();
        var subjectOpt = jwtService.extractSubject(token);
        if (subjectOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        String email = subjectOpt.get();
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        User user = userOpt.get();
        
        // Delete user (cascade will handle related records if configured)
        userRepository.delete(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account deleted successfully");
        return ResponseEntity.ok(response);
    }
}


