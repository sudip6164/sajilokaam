package com.sajilokaam.savedjob;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.job.Job;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/saved-jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class SavedJobController {
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public SavedJobController(SavedJobRepository savedJobRepository, JobRepository jobRepository,
                             UserRepository userRepository, JwtService jwtService) {
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<SavedJob>> getMySavedJobs(
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

        List<SavedJob> savedJobs = savedJobRepository.findByUserId(userOpt.get().getId());
        return ResponseEntity.ok(savedJobs);
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<SavedJob> saveJob(
            @PathVariable Long jobId,
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
        User user = userOpt.get();

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Job job = jobOpt.get();

        // Check if already saved
        if (savedJobRepository.existsByUserIdAndJobId(user.getId(), jobId)) {
            return ResponseEntity.badRequest().build();
        }

        SavedJob savedJob = new SavedJob();
        savedJob.setUser(user);
        savedJob.setJob(job);

        SavedJob created = savedJobRepository.save(savedJob);
        URI location = URI.create("/api/saved-jobs/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> unsaveJob(
            @PathVariable Long jobId,
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
        User user = userOpt.get();

        Optional<SavedJob> savedJobOpt = savedJobRepository.findByUserIdAndJobId(user.getId(), jobId);
        if (savedJobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        savedJobRepository.delete(savedJobOpt.get());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<Boolean> isJobSaved(
            @PathVariable Long jobId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.ok(false);
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.ok(false);
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(false);
        }

        boolean isSaved = savedJobRepository.existsByUserIdAndJobId(userOpt.get().getId(), jobId);
        return ResponseEntity.ok(isSaved);
    }
}

