package com.sajilokaam.search;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.job.Job;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:5173")
public class SearchController {

    private final JobRepository jobRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public SearchController(
            JobRepository jobRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            JwtService jwtService) {
        this.jobRepository = jobRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/global")
    public ResponseEntity<List<SearchResult>> globalSearch(
            @RequestParam String q,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        String query = q.toLowerCase().trim();
        if (query.length() < 2) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<SearchResult> results = new ArrayList<>();

        // Search Jobs
        List<Job> jobs = jobRepository.findAll().stream()
                .filter(job -> 
                    job.getTitle().toLowerCase().contains(query) ||
                    (job.getDescription() != null && job.getDescription().toLowerCase().contains(query))
                )
                .limit(5)
                .collect(Collectors.toList());

        for (Job job : jobs) {
            SearchResult result = new SearchResult();
            result.setType("JOB");
            result.setId(job.getId());
            result.setTitle(job.getTitle());
            result.setDescription(job.getDescription());
            result.setMetadata("Status: " + job.getStatus());
            results.add(result);
        }

        // Search Projects
        List<Project> projects = projectRepository.findAll().stream()
                .filter(project ->
                    project.getTitle().toLowerCase().contains(query) ||
                    (project.getDescription() != null && project.getDescription().toLowerCase().contains(query))
                )
                .limit(5)
                .collect(Collectors.toList());

        for (Project project : projects) {
            SearchResult result = new SearchResult();
            result.setType("PROJECT");
            result.setId(project.getId());
            result.setTitle(project.getTitle());
            result.setDescription(project.getDescription());
            if (project.getJob() != null) {
                result.setMetadata("Job: " + project.getJob().getTitle());
            }
            results.add(result);
        }

        // Search Tasks
        List<Task> tasks = taskRepository.findAll().stream()
                .filter(task ->
                    task.getTitle().toLowerCase().contains(query) ||
                    (task.getDescription() != null && task.getDescription().toLowerCase().contains(query))
                )
                .limit(5)
                .collect(Collectors.toList());

        for (Task task : tasks) {
            SearchResult result = new SearchResult();
            result.setType("TASK");
            result.setId(task.getId());
            result.setTitle(task.getTitle());
            result.setDescription(task.getDescription());
            result.setProjectId(task.getProject().getId());
            result.setMetadata("Status: " + task.getStatus() + " | Priority: " + (task.getPriority() != null ? task.getPriority() : "N/A"));
            results.add(result);
        }

        // Search Users (only if query is longer for privacy)
        if (query.length() >= 3) {
            List<User> users = userRepository.findAll().stream()
                    .filter(user ->
                        user.getFullName().toLowerCase().contains(query) ||
                        user.getEmail().toLowerCase().contains(query)
                    )
                    .limit(5)
                    .collect(Collectors.toList());

            for (User user : users) {
                SearchResult result = new SearchResult();
                result.setType("USER");
                result.setId(user.getId());
                result.setTitle(user.getFullName());
                result.setDescription(user.getEmail());
                result.setMetadata(user.getRoles().stream()
                        .map(r -> r.getName())
                        .collect(Collectors.joining(", ")));
                results.add(result);
            }
        }

        return ResponseEntity.ok(results);
    }

    public static class SearchResult {
        private String type;
        private Long id;
        private String title;
        private String description;
        private String metadata;
        private Long projectId;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getMetadata() { return metadata; }
        public void setMetadata(String metadata) { this.metadata = metadata; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }
}

