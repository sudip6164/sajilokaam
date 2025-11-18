package com.sajilokaam.user;

import com.sajilokaam.auth.JwtService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserContextService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public UserContextService(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    public Optional<User> resolveUser(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        return emailOpt.flatMap(userRepository::findByEmail);
    }
}



