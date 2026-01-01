package com.sajilokaam.config;

import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminPasswordInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminPasswordInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            Optional<User> adminOpt = userRepository.findByEmail("admin@sajilokaam.com");
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                // Always ensure admin password is correct
                String correctHash = passwordEncoder.encode("admin123");
                admin.setPassword(correctHash);
                userRepository.save(admin);
                System.out.println("========================================");
                System.out.println("Admin password has been reset to 'admin123'");
                System.out.println("New hash: " + correctHash);
                System.out.println("Verifying hash matches password: " + passwordEncoder.matches("admin123", correctHash));
                System.out.println("========================================");
            } else {
                System.err.println("WARNING: Admin user not found in database!");
            }
        } catch (Exception e) {
            System.err.println("ERROR resetting admin password: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

