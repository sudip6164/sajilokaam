package com.sajilokaam.job;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.jobcategory.JobCategory;
import com.sajilokaam.jobcategory.JobCategoryRepository;
import com.sajilokaam.jobskill.JobSkill;
import com.sajilokaam.jobskill.JobSkillRepository;
import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final JobCategoryRepository categoryRepository;
    private final JobSkillRepository skillRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final JobDetailsRepository jobDetailsRepository;

    public JobController(JobRepository jobRepository, UserRepository userRepository, JwtService jwtService,
                         JobCategoryRepository categoryRepository, JobSkillRepository skillRepository,
                         FreelancerProfileRepository freelancerProfileRepository, JobDetailsRepository jobDetailsRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.jobDetailsRepository = jobDetailsRepository;
    }

    @GetMapping
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<Job>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) BigDecimal budgetMin,
            @RequestParam(required = false) BigDecimal budgetMax,
            @RequestParam(required = false) Long skillId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String projectLength,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (jobType != null && !jobType.isBlank()) {
                predicates.add(cb.equal(root.get("jobType"), jobType));
            }
            if (experienceLevel != null && !experienceLevel.isBlank()) {
                predicates.add(cb.equal(root.get("experienceLevel"), experienceLevel));
            }
            if (budgetMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("budgetMax"), budgetMin));
            }
            if (budgetMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("budgetMin"), budgetMax));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (featured != null) {
                predicates.add(cb.equal(root.get("isFeatured"), featured));
            }
            if (skillId != null) {
                predicates.add(cb.isMember(
                    skillRepository.findById(skillId).orElse(null),
                    root.get("requiredSkills")
                ));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.equal(root.get("location"), location));
            }
            if (projectLength != null && !projectLength.isBlank()) {
                predicates.add(cb.equal(root.get("projectLength"), projectLength));
            }
            
            // Filter out expired jobs
            predicates.add(cb.or(
                cb.isNull(root.get("expiresAt")),
                cb.greaterThan(root.get("expiresAt"), LocalDateTime.now())
            ));
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        List<Job> jobs = jobRepository.findAll(spec);
        
        // Initialize lazy-loaded relationships to avoid LazyInitializationException
        for (Job job : jobs) {
            if (job.getClient() != null) {
                job.getClient().getEmail(); // Trigger lazy load
            }
            if (job.getCategory() != null) {
                job.getCategory().getName(); // Trigger lazy load
            }
            if (job.getRequiredSkills() != null) {
                job.getRequiredSkills().size(); // Trigger lazy load
            }
        }
        
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/my-jobs")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<Job>> getMyJobs(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        List<Job> jobs = jobRepository.findByClient_Id(userOpt.get().getId());
        
        // Initialize lazy-loaded relationships to avoid LazyInitializationException
        for (Job job : jobs) {
            if (job.getClient() != null) {
                job.getClient().getEmail(); // Trigger lazy load
            }
            if (job.getCategory() != null) {
                job.getCategory().getName(); // Trigger lazy load
            }
            if (job.getRequiredSkills() != null) {
                job.getRequiredSkills().size(); // Trigger lazy load
            }
        }
        
        return ResponseEntity.ok(jobs);
    }


    @GetMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Job> get(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Job job = jobOpt.get();
        
        // Job details are public - anyone can view jobs to browse and submit proposals
        // No authorization check needed here
        
        // Force eager loading of relationships to avoid lazy loading issues
        if (job.getClient() != null) {
            job.getClient().getEmail(); // Trigger lazy load
        }
        if (job.getCategory() != null) {
            job.getCategory().getName(); // Trigger lazy load
        }
        if (job.getRequiredSkills() != null) {
            job.getRequiredSkills().size(); // Trigger lazy load
        }
        // Load job details if exists
        if (job.getJobDetails() != null) {
            job.getJobDetails().getRequirements(); // Trigger lazy load
        }
        return ResponseEntity.ok(job);
    }

    @PostMapping
    public ResponseEntity<Job> create(
            @RequestBody JobCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Job job = new Job();
        job.setClient(userOpt.get());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setStatus(request.getStatus() != null ? request.getStatus() : "OPEN");
        
        // Set category
        if (request.getCategoryId() != null) {
            Optional<JobCategory> categoryOpt = categoryRepository.findById(request.getCategoryId());
            categoryOpt.ifPresent(job::setCategory);
        }
        
        // Set job type and budget
        job.setJobType(request.getJobType() != null ? request.getJobType() : "FIXED_PRICE");
        job.setBudgetMin(request.getBudgetMin());
        job.setBudgetMax(request.getBudgetMax());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setDurationHours(request.getDurationHours());
        job.setExpiresAt(request.getExpiresAt());
        job.setDeadline(request.getDeadline());
        job.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        
        // Set required skills
        Set<JobSkill> skills = new HashSet<>();
        
        // Add existing skills from database
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            for (Long skillId : request.getSkillIds()) {
                skillRepository.findById(skillId).ifPresent(skills::add);
            }
        }
        
        // Create new JobSkill entries for custom skills
        if (request.getCustomSkills() != null && !request.getCustomSkills().isEmpty()) {
            for (String customSkillName : request.getCustomSkills()) {
                if (customSkillName != null && !customSkillName.trim().isEmpty()) {
                    // Check if skill already exists
                    Optional<JobSkill> existing = skillRepository.findByNameIgnoreCase(customSkillName.trim());
                    if (existing.isPresent()) {
                        skills.add(existing.get());
                    } else {
                        // Create new skill
                        JobSkill newSkill = new JobSkill();
                        newSkill.setName(customSkillName.trim());
                        // Associate with job category if available
                        if (job.getCategory() != null) {
                            newSkill.setCategory(job.getCategory());
                        }
                        JobSkill savedSkill = skillRepository.save(newSkill);
                        skills.add(savedSkill);
                    }
                }
            }
        }
        
        job.setRequiredSkills(skills);

        // Set location and project length
        job.setLocation(request.getLocation());
        job.setProjectLength(request.getProjectLength());

        Job created = jobRepository.save(job);

        // Create job details if requirements or deliverables are provided
        if ((request.getRequirements() != null && !request.getRequirements().isBlank()) ||
            (request.getDeliverables() != null && !request.getDeliverables().isBlank())) {
            JobDetails jobDetails = new JobDetails();
            jobDetails.setJob(created);
            jobDetails.setRequirements(request.getRequirements());
            jobDetails.setDeliverables(request.getDeliverables());
            jobDetailsRepository.save(jobDetails);
        }

        URI location = URI.create("/api/jobs/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> update(
            @PathVariable Long id,
            @RequestBody JobUpdateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Job job = jobOpt.get();
        // Verify user is the client who owns the job
        if (!job.getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            job.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            job.setDescription(request.getDescription());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            job.setStatus(request.getStatus());
        }
        if (request.getLocation() != null) {
            job.setLocation(request.getLocation());
        }
        if (request.getProjectLength() != null) {
            job.setProjectLength(request.getProjectLength());
        }
        if (request.getDeadline() != null) {
            job.setDeadline(request.getDeadline());
        }

        Job updated = jobRepository.save(job);

        // Update or create job details
        if (request.getRequirements() != null || request.getDeliverables() != null) {
            Optional<JobDetails> detailsOpt = jobDetailsRepository.findByJobId(updated.getId());
            JobDetails jobDetails;
            if (detailsOpt.isPresent()) {
                jobDetails = detailsOpt.get();
            } else {
                jobDetails = new JobDetails();
                jobDetails.setJob(updated);
            }
            if (request.getRequirements() != null) {
                jobDetails.setRequirements(request.getRequirements());
            }
            if (request.getDeliverables() != null) {
                jobDetails.setDeliverables(request.getDeliverables());
            }
            jobDetailsRepository.save(jobDetails);
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Job job = jobOpt.get();
        // Verify user is the client who owns the job
        if (!job.getClient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        jobRepository.delete(job);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Job>> getRecommendations(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // Get freelancer profile to match skills
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        FreelancerProfile profile = profileOpt.get();
        
        // Extract skills from profile (comma-separated)
        Set<String> freelancerSkills = new HashSet<>();
        if (profile.getPrimarySkills() != null && !profile.getPrimarySkills().isBlank()) {
            String[] skills = profile.getPrimarySkills().split(",");
            for (String skill : skills) {
                freelancerSkills.add(skill.trim().toLowerCase());
            }
        }
        if (profile.getSecondarySkills() != null && !profile.getSecondarySkills().isBlank()) {
            String[] skills = profile.getSecondarySkills().split(",");
            for (String skill : skills) {
                freelancerSkills.add(skill.trim().toLowerCase());
            }
        }

        // Get all open jobs
        List<Job> allJobs = jobRepository.findAll();
        
        // Filter and score jobs based on skill matches
        List<Job> recommendations = allJobs.stream()
            .filter(job -> "OPEN".equals(job.getStatus()))
            .filter(job -> job.getExpiresAt() == null || job.getExpiresAt().isAfter(LocalDateTime.now()))
            .map(job -> {
                // Calculate match score based on required skills
                int matchScore = 0;
                if (job.getRequiredSkills() != null && !job.getRequiredSkills().isEmpty()) {
                    for (JobSkill requiredSkill : job.getRequiredSkills()) {
                        String skillName = requiredSkill.getName().toLowerCase();
                        if (freelancerSkills.contains(skillName)) {
                            matchScore++;
                        }
                    }
                }
                // Store match score as a transient field (we'll use it for sorting)
                return new Object[] { job, matchScore };
            })
            .filter(pair -> ((Integer) pair[1]) > 0) // Only jobs with at least one matching skill
            .sorted((a, b) -> ((Integer) b[1]).compareTo((Integer) a[1])) // Sort by match score descending
            .limit(10) // Top 10 recommendations
            .map(pair -> (Job) pair[0])
            .collect(Collectors.toList());

        return ResponseEntity.ok(recommendations);
    }
}

