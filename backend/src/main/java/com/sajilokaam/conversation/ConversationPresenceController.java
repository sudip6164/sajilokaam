package com.sajilokaam.conversation;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationPresenceController {
    private final ConversationRepository conversationRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ConversationPresenceController(ConversationRepository conversationRepository,
                                          JwtService jwtService,
                                          UserRepository userRepository,
                                          SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/{conversationId}/typing")
    public ResponseEntity<Void> sendTypingStatus(
            @PathVariable Long conversationId,
            @RequestBody TypingStatusRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = authenticate(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Conversation conversation = conversationOpt.get();
        if (!isParticipant(conversation, user.getId())) {
            return ResponseEntity.status(403).build();
        }

        TypingStatusPayload payload = new TypingStatusPayload();
        payload.setConversationId(conversationId);
        payload.setUserId(user.getId());
        payload.setUserName(user.getFullName());
        payload.setTyping(request.isTyping());
        payload.setTimestamp(Instant.now().toString());

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", payload);
        return ResponseEntity.accepted().build();
    }

    private Optional<User> authenticate(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(emailOpt.get());
    }

    private boolean isParticipant(Conversation conversation, Long userId) {
        return conversation.getParticipants()
                .stream()
                .anyMatch(participant -> participant.getId().equals(userId));
    }

    public static class TypingStatusRequest {
        private boolean typing;

        public boolean isTyping() {
            return typing;
        }

        public void setTyping(boolean typing) {
            this.typing = typing;
        }
    }

    public static class TypingStatusPayload {
        private Long conversationId;
        private Long userId;
        private String userName;
        private boolean typing;
        private String timestamp;

        public Long getConversationId() {
            return conversationId;
        }

        public void setConversationId(Long conversationId) {
            this.conversationId = conversationId;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public boolean isTyping() {
            return typing;
        }

        public void setTyping(boolean typing) {
            this.typing = typing;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }
}


