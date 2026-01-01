package com.sajilokaam.user;

import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;

    public UserController(UserRepository userRepository, FreelancerProfileRepository freelancerProfileRepository) {
        this.userRepository = userRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
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

    /**
     * Public endpoint to get freelancer profile by user ID (no authentication required)
     */
    @GetMapping("/freelancers/{userId}")
    public ResponseEntity<FreelancerPublicProfileResponse> getFreelancerProfile(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        // Verify user is a freelancer
        boolean isFreelancer = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("FREELANCER"));
        if (!isFreelancer) {
            return ResponseEntity.notFound().build();
        }
        
        // Get freelancer profile if exists
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(userId);
        
        FreelancerPublicProfileResponse response = new FreelancerPublicProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        
        if (profileOpt.isPresent()) {
            FreelancerProfile profile = profileOpt.get();
            response.setHeadline(profile.getHeadline());
            response.setOverview(profile.getOverview());
            response.setHourlyRate(profile.getHourlyRate());
            response.setHourlyRateMin(profile.getHourlyRateMin());
            response.setHourlyRateMax(profile.getHourlyRateMax());
            response.setAvailability(profile.getAvailability());
            response.setExperienceLevel(profile.getExperienceLevel());
            response.setExperienceYears(profile.getExperienceYears());
            response.setLocationCountry(profile.getLocationCountry());
            response.setLocationCity(profile.getLocationCity());
            response.setPrimarySkills(profile.getPrimarySkills());
            response.setSecondarySkills(profile.getSecondarySkills());
            response.setLanguages(profile.getLanguages());
            response.setEducation(profile.getEducation());
            response.setCertifications(profile.getCertifications());
            response.setPortfolioUrl(profile.getPortfolioUrl());
            response.setWebsiteUrl(profile.getWebsiteUrl());
            response.setLinkedinUrl(profile.getLinkedinUrl());
            response.setGithubUrl(profile.getGithubUrl());
            response.setStatus(profile.getStatus());
        }
        
        return ResponseEntity.ok(response);
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

    // Public DTO for freelancer profile
    public static class FreelancerPublicProfileResponse {
        private Long id;
        private String fullName;
        private String email;
        private String headline;
        private String overview;
        private java.math.BigDecimal hourlyRate;
        private java.math.BigDecimal hourlyRateMin;
        private java.math.BigDecimal hourlyRateMax;
        private String availability;
        private String experienceLevel;
        private Integer experienceYears;
        private String locationCountry;
        private String locationCity;
        private String primarySkills;
        private String secondarySkills;
        private String languages;
        private String education;
        private String certifications;
        private String portfolioUrl;
        private String websiteUrl;
        private String linkedinUrl;
        private String githubUrl;
        private String status;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getHeadline() { return headline; }
        public void setHeadline(String headline) { this.headline = headline; }

        public String getOverview() { return overview; }
        public void setOverview(String overview) { this.overview = overview; }

        public java.math.BigDecimal getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(java.math.BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

        public java.math.BigDecimal getHourlyRateMin() { return hourlyRateMin; }
        public void setHourlyRateMin(java.math.BigDecimal hourlyRateMin) { this.hourlyRateMin = hourlyRateMin; }

        public java.math.BigDecimal getHourlyRateMax() { return hourlyRateMax; }
        public void setHourlyRateMax(java.math.BigDecimal hourlyRateMax) { this.hourlyRateMax = hourlyRateMax; }

        public String getAvailability() { return availability; }
        public void setAvailability(String availability) { this.availability = availability; }

        public String getExperienceLevel() { return experienceLevel; }
        public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

        public Integer getExperienceYears() { return experienceYears; }
        public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

        public String getLocationCountry() { return locationCountry; }
        public void setLocationCountry(String locationCountry) { this.locationCountry = locationCountry; }

        public String getLocationCity() { return locationCity; }
        public void setLocationCity(String locationCity) { this.locationCity = locationCity; }

        public String getPrimarySkills() { return primarySkills; }
        public void setPrimarySkills(String primarySkills) { this.primarySkills = primarySkills; }

        public String getSecondarySkills() { return secondarySkills; }
        public void setSecondarySkills(String secondarySkills) { this.secondarySkills = secondarySkills; }

        public String getLanguages() { return languages; }
        public void setLanguages(String languages) { this.languages = languages; }

        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }

        public String getCertifications() { return certifications; }
        public void setCertifications(String certifications) { this.certifications = certifications; }

        public String getPortfolioUrl() { return portfolioUrl; }
        public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

        public String getWebsiteUrl() { return websiteUrl; }
        public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
