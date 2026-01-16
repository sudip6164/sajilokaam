package com.sajilokaam.conversation;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.user.UserContextService;
import com.sajilokaam.message.Message;
import com.sajilokaam.message.MessageRepository;
import com.sajilokaam.profile.ClientProfile;
import com.sajilokaam.profile.ClientProfileRepository;
import com.sajilokaam.profile.FreelancerProfile;
import com.sajilokaam.profile.FreelancerProfileRepository;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationController {
    private final ConversationRepository conversationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SimpMessagingTemplate messagingTemplate;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final MessageRepository messageRepository;
    private final UserContextService userContextService;

    public ConversationController(ConversationRepository conversationRepository,
                                 ProjectRepository projectRepository,
                                 UserRepository userRepository,
                                 JwtService jwtService,
                                 SimpMessagingTemplate messagingTemplate,
                                 FreelancerProfileRepository freelancerProfileRepository,
                                 ClientProfileRepository clientProfileRepository,
                                 MessageRepository messageRepository,
                                 UserContextService userContextService) {
        this.conversationRepository = conversationRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.messagingTemplate = messagingTemplate;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
        this.messageRepository = messageRepository;
        this.userContextService = userContextService;
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getConversations(
            @RequestParam(required = false) Long projectId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (projectId != null) {
            if (!projectRepository.existsById(projectId)) {
                return ResponseEntity.notFound().build();
            }
            List<Conversation> conversations = conversationRepository.findByProjectId(projectId);
            return ResponseEntity.ok(conversations);
        }
        // If no projectId, return all conversations for the authenticated user
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

        List<Conversation> conversations = conversationRepository.findByParticipantsContaining(userOpt.get().getId());
        
        // Deduplicate conversations by ID (in case query returns duplicates)
        Map<Long, Conversation> uniqueConversations = new LinkedHashMap<>();
        for (Conversation conversation : conversations) {
            uniqueConversations.putIfAbsent(conversation.getId(), conversation);
        }
        conversations = new ArrayList<>(uniqueConversations.values());
        
        // Enrich participants with profile pictures and populate lastMessage
        for (Conversation conversation : conversations) {
            for (User participant : conversation.getParticipants()) {
                String profilePicUrl = getProfilePictureUrl(participant.getId());
                participant.setProfilePictureUrl(profilePicUrl);
                
                // Determine user type by checking if they have freelancer or client profile
                if (freelancerProfileRepository.findByUserId(participant.getId()).isPresent()) {
                    participant.setUserType("FREELANCER");
                } else if (clientProfileRepository.findByUserId(participant.getId()).isPresent()) {
                    participant.setUserType("CLIENT");
                }
            }
            
            // Populate last message
            Message lastMessage = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId());
            if (lastMessage != null) {
                conversation.setLastMessage(lastMessage);
            }
        }
        
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Conversation>> getProjectConversations(@PathVariable Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }
        List<Conversation> conversations = conversationRepository.findByProjectId(projectId);
        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/direct/{recipientId}")
    public ResponseEntity<Conversation> createDirectConversation(
            @PathVariable Long recipientId,
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

        Optional<User> recipientOpt = userRepository.findById(recipientId);
        if (recipientOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if conversation already exists between these two users
        List<Conversation> userConversations = conversationRepository.findByParticipantsContaining(userOpt.get().getId());
        for (Conversation conv : userConversations) {
            // Only consider direct conversations (no project)
            if (conv.getProject() == null) {
                Set<User> participants = conv.getParticipants();
                if (participants.size() == 2) {
                    boolean containsCurrentUser = participants.stream()
                        .anyMatch(p -> p.getId().equals(userOpt.get().getId()));
                    boolean containsRecipient = participants.stream()
                        .anyMatch(p -> p.getId().equals(recipientId));
                    
                    if (containsCurrentUser && containsRecipient) {
                        System.out.println("Found existing conversation " + conv.getId() + " between users");
                        return ResponseEntity.ok(conv);
                    }
                }
            }
        }

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setTitle("Direct Message");

        Set<User> participants = new HashSet<>();
        participants.add(userOpt.get());
        participants.add(recipientOpt.get());
        conversation.setParticipants(participants);

        Conversation created = conversationRepository.save(conversation);
        return ResponseEntity.ok(created);
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

        Project project = projectOpt.get();
        User currentUser = userOpt.get();
        
        // Determine the other participant (client or freelancer)
        User otherParticipant = null;
        if (project.getClient() != null && project.getClient().getId().equals(currentUser.getId())) {
            // Current user is the client, other participant is freelancer
            otherParticipant = project.getFreelancer();
        } else if (project.getFreelancer() != null && project.getFreelancer().getId().equals(currentUser.getId())) {
            // Current user is the freelancer, other participant is client
            otherParticipant = project.getClient();
        } else {
            // Current user is neither, use project client/freelancer as other participant
            otherParticipant = project.getClient() != null ? project.getClient() : project.getFreelancer();
        }

        // Check if a direct conversation already exists between these two users
        if (otherParticipant != null) {
            List<Conversation> allConversations = conversationRepository.findByParticipantsContaining(currentUser.getId());
            for (Conversation conv : allConversations) {
                // Check if this is a direct conversation (no project) with the other participant
                if (conv.getProject() == null) {
                    Set<User> participants = conv.getParticipants();
                    if (participants.size() == 2 && participants.contains(currentUser) && participants.contains(otherParticipant)) {
                        // Found existing direct conversation - return it instead of creating a new one
                        return ResponseEntity.ok(conv);
                    }
                }
            }
            
            // No existing direct conversation found, create one
            Conversation conversation = new Conversation();
            conversation.setTitle("Direct Message");
            
            Set<User> participants = new HashSet<>();
            participants.add(currentUser);
            participants.add(otherParticipant);
            conversation.setParticipants(participants);
            
            Conversation created = conversationRepository.save(conversation);
            return ResponseEntity.ok(created);
        }

        // Fallback: if we can't determine the other participant, check project conversations
        List<Conversation> existingConversations = conversationRepository.findByProjectId(projectId);
        if (!existingConversations.isEmpty()) {
            return ResponseEntity.ok(existingConversations.get(0));
        }

        // Last resort: create project-based conversation (shouldn't happen in normal flow)
        Conversation conversation = new Conversation();
        conversation.setProject(project);
        conversation.setTitle(request.getTitle() != null ? request.getTitle() : project.getTitle());

        Set<User> participants = new HashSet<>();
        participants.add(currentUser);
        if (project.getClient() != null) {
            participants.add(project.getClient());
        }
        if (project.getFreelancer() != null) {
            participants.add(project.getFreelancer());
        }
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

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteConversation(
            @PathVariable Long id,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Conversation> conversationOpt = conversationRepository.findById(id);
        if (conversationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Conversation conversation = conversationOpt.get();
        
        // Check if user is a participant
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(userOpt.get().getId()));
        
        if (!isParticipant) {
            return ResponseEntity.status(403).body("You are not a participant in this conversation");
        }

        // Delete all messages in the conversation first
        messageRepository.deleteByConversationId(id);
        
        // Then delete the conversation
        conversationRepository.deleteById(id);
        
        return ResponseEntity.ok().body(Map.of("message", "Conversation deleted successfully"));
    }
    
    private String getProfilePictureUrl(Long userId) {
        // Try to find freelancer profile first
        Optional<FreelancerProfile> freelancerProfile = freelancerProfileRepository.findByUserId(userId);
        if (freelancerProfile.isPresent() && freelancerProfile.get().getProfilePictureUrl() != null) {
            return freelancerProfile.get().getProfilePictureUrl();
        }
        
        // Try to find client profile
        Optional<ClientProfile> clientProfile = clientProfileRepository.findByUserId(userId);
        if (clientProfile.isPresent() && clientProfile.get().getProfilePictureUrl() != null) {
            return clientProfile.get().getProfilePictureUrl();
        }
        
        return null;
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

