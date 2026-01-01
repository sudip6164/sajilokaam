package com.sajilokaam.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Public endpoint to get freelancers (no admin required)
     * Returns only basic information: id, fullName, email
     */
    @GetMapping("/freelancers")
    public ResponseEntity<FreelancerPageResponse> getFreelancers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findAll(pageable);
        
        // Filter for freelancers and map to public info
        List<FreelancerPublicInfo> freelancers = users.getContent().stream()
                .filter(user -> user.getRoles() != null && user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals("FREELANCER")))
                .map(user -> new FreelancerPublicInfo(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(new FreelancerPageResponse(
                freelancers,
                freelancers.size(),
                1,
                page,
                size
        ));
    }

    // Public DTO for freelancer information
    public static class FreelancerPublicInfo {
        private Long id;
        private String fullName;
        private String email;

        public FreelancerPublicInfo(Long id, String fullName, String email) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // Response wrapper matching frontend expectations
    public static class FreelancerPageResponse {
        private List<FreelancerPublicInfo> content;
        private int totalElements;
        private int totalPages;
        private int number;
        private int size;

        public FreelancerPageResponse(List<FreelancerPublicInfo> content, int totalElements, int totalPages, int number, int size) {
            this.content = content;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.number = number;
            this.size = size;
        }

        public List<FreelancerPublicInfo> getContent() { return content; }
        public void setContent(List<FreelancerPublicInfo> content) { this.content = content; }

        public int getTotalElements() { return totalElements; }
        public void setTotalElements(int totalElements) { this.totalElements = totalElements; }

        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

        public int getNumber() { return number; }
        public void setNumber(int number) { this.number = number; }

        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }
}
