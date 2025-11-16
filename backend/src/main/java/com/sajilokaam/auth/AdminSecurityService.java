package com.sajilokaam.auth;

import com.sajilokaam.role.Role;
import com.sajilokaam.role.RoleRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminSecurityService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;

    public AdminSecurityService(UserRepository userRepository, RoleRepository roleRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }

    /**
     * Verifies if the user from the JWT token has ADMIN role
     * @param authorizationHeader The Authorization header value (Bearer token)
     * @return Optional User if authenticated and is admin, empty otherwise
     */
    public Optional<User> verifyAdmin(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return Optional.empty();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElse(null);

        if (adminRole == null) {
            return Optional.empty();
        }

        // Check if user has ADMIN role
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN"));

        return isAdmin ? Optional.of(user) : Optional.empty();
    }

    /**
     * Checks if a user has ADMIN role
     * @param user The user to check
     * @return true if user has ADMIN role, false otherwise
     */
    public boolean isAdmin(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN"));
    }
}

