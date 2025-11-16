package com.sajilokaam.user;

import com.sajilokaam.role.Role;
import com.sajilokaam.role.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.net.URI;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> list() {
        return userRepository.findAll();
    }

    @GetMapping("/freelancers")
    public List<User> getFreelancers() {
        Role freelancerRole = roleRepository.findByName("FREELANCER")
                .orElseThrow(() -> new RuntimeException("FREELANCER role not found"));
        return userRepository.findByRolesContaining(freelancerRole);
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody UserCreateRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank() ||
            request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        // Assign default role: FREELANCER
        Role freelancerRole = roleRepository.findByName("FREELANCER")
                .orElseThrow(() -> new RuntimeException("FREELANCER role not found. Ensure V2__seed_roles.sql migration has run."));
        Set<Role> roles = new HashSet<>();
        roles.add(freelancerRole);
        user.setRoles(roles);

        User created = userRepository.save(user);
        // Reload to ensure roles are fetched
        User saved = userRepository.findById(created.getId()).orElse(created);
        return ResponseEntity.created(URI.create("/api/users/" + saved.getId())).body(saved);
    }
}


