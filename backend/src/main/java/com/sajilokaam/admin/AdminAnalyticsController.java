package com.sajilokaam.admin;

import com.sajilokaam.auth.RequiresAdmin;
import com.sajilokaam.bid.BidRepository;
import com.sajilokaam.job.JobRepository;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminAnalyticsController {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final BidRepository bidRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public AdminAnalyticsController(
            UserRepository userRepository,
            JobRepository jobRepository,
            BidRepository bidRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.bidRepository = bidRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // User statistics
        long totalUsers = userRepository.count();
        overview.put("totalUsers", totalUsers);
        
        // Job statistics
        long totalJobs = jobRepository.count();
        overview.put("totalJobs", totalJobs);
        
        // Bid statistics
        long totalBids = bidRepository.count();
        overview.put("totalBids", totalBids);
        
        // Project statistics
        long totalProjects = projectRepository.count();
        overview.put("totalProjects", totalProjects);
        
        // Task statistics
        long totalTasks = taskRepository.count();
        overview.put("totalTasks", totalTasks);
        
        return ResponseEntity.ok(overview);
    }
}

