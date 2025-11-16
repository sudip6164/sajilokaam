package com.sajilokaam.conversation;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationController {
    private final ConversationRepository conversationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SimpMessagingTemplate messagingTemplate;

    public ConversationController(ConversationRepository conversationRepository,
                                 ProjectRepository projectRepository,
                                 UserRepository userRepository,
                                 JwtService jwtService,
                                 SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Conversation>> getProjectConversations(@PathVariable Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }
        List<Conversation> conversations = conversationRepository.findByProjectId(projectId);
        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Conversation> createConversation(
            @PathVariable Long projectId,
            @RequestBody ConversationCreateRequest request,
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

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Conversation conversation = new Conversation();
        conversation.setProject(projectOpt.get());
        conversation.setTitle(request.getTitle());

        // Add participants
        Set<User> participants = new HashSet<>();
        participants.add(userOpt.get()); // Add creator
        if (request.getParticipantIds() != null) {
            for (Long userId : request.getParticipantIds()) {
                userRepository.findById(userId).ifPresent(participants::add);
            }
        }
        conversation.setParticipants(participants);

        Conversation created = conversationRepository.save(conversation);
        URI location = URI.create("/api/conversations/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversation(@PathVariable Long id) {
        return conversationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public static class ConversationCreateRequest {
        private String title;
        private List<Long> participantIds;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<Long> getParticipantIds() {
            return participantIds;
        }

        public void setParticipantIds(List<Long> participantIds) {
            this.participantIds = participantIds;
        }
    }
}

