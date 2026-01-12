package com.sajilokaam.config;

import com.sajilokaam.conversation.Conversation;
import com.sajilokaam.conversation.ConversationRepository;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.user.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ConversationInitializer implements CommandLineRunner {
    private final ProjectRepository projectRepository;
    private final ConversationRepository conversationRepository;

    public ConversationInitializer(ProjectRepository projectRepository, 
                                   ConversationRepository conversationRepository) {
        this.projectRepository = projectRepository;
        this.conversationRepository = conversationRepository;
    }

    @Override
    public void run(String... args) {
        try {
            System.out.println("========================================");
            System.out.println("Checking for projects without conversations...");
            
            List<Project> allProjects = projectRepository.findAll();
            int created = 0;
            
            for (Project project : allProjects) {
                // Check if conversation already exists for this project
                List<Conversation> existing = conversationRepository.findByProjectId(project.getId());
                
                if (existing.isEmpty() && project.getFreelancer() != null && project.getClient() != null) {
                    // Create conversation
                    Conversation conversation = new Conversation();
                    conversation.setProject(project);
                    conversation.setTitle("Project: " + project.getTitle());
                    
                    Set<User> participants = new HashSet<>();
                    participants.add(project.getClient());
                    participants.add(project.getFreelancer());
                    conversation.setParticipants(participants);
                    
                    conversationRepository.save(conversation);
                    created++;
                    System.out.println("Created conversation for project: " + project.getTitle());
                }
            }
            
            System.out.println("Created " + created + " conversations for existing projects");
            System.out.println("========================================");
        } catch (Exception e) {
            System.err.println("Error creating conversations: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
