package com.sajilokaam.auth;

import com.sajilokaam.role.Role;
import com.sajilokaam.role.RoleRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
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
            if (request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().build();
            }
            u.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(u);
        return ResponseEntity.ok(new UserProfile(updated.getId(), updated.getEmail(), updated.getFullName(), updated.getRoles()));
    }
}


