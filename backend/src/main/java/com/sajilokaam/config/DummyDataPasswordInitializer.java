package com.sajilokaam.config;

import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DummyDataPasswordInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Dummy user emails
    private static final List<String> DUMMY_USER_EMAILS = Arrays.asList(
        "freelancer1@example.com",
        "freelancer2@example.com",
        "client1@example.com",
        "client2@example.com"
    );

    public DummyDataPasswordInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            String passwordHash = passwordEncoder.encode("password");
            System.out.println("========================================");
            System.out.println("Setting passwords for dummy users to 'password'");
            System.out.println("Hash: " + passwordHash);
            System.out.println("========================================");

            for (String email : DUMMY_USER_EMAILS) {
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    user.setPassword(passwordHash);
                    userRepository.save(user);
                    System.out.println("Updated password for: " + email);
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR setting dummy user passwords: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

