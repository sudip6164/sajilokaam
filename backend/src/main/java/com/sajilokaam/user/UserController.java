package com.sajilokaam.user;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> list() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<User> create(@Validated @RequestBody User body) {
        // Minimal validation
        if (body.getEmail() == null || body.getEmail().isBlank() || body.getPassword() == null || body.getPassword().isBlank() || body.getFullName() == null || body.getFullName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        User created = userRepository.save(body);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(created);
    }
}


