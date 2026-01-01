package com.sajilokaam.config;

import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminPasswordInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminPasswordInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        Optional<User> adminOpt = userRepository.findByEmail("admin@sajilokaam.com");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            // Always ensure admin password is correct
            String correctHash = passwordEncoder.encode("admin123");
            admin.setPassword(correctHash);
            userRepository.save(admin);
            System.out.println("Admin password has been reset to 'admin123'");
        }
    }
}

