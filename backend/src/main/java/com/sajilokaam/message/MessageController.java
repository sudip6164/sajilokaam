package com.sajilokaam.message;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.conversation.Conversation;
import com.sajilokaam.conversation.ConversationRepository;
import com.sajilokaam.notification.NotificationService;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public MessageController(MessageRepository messageRepository,
                            ConversationRepository conversationRepository,
                            UserRepository userRepository,
                            JwtService jwtService,
                            SimpMessagingTemplate messagingTemplate,
                            NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!conversationRepository.existsById(conversationId)) {
            return ResponseEntity.notFound().build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messagesPage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<Message> messages = messagesPage.getContent();
        // Reverse to show oldest first
        java.util.Collections.reverse(messages);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<Message> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageCreateRequest request,
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
        User sender = userOpt.get();

        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Conversation conversation = conversationOpt.get();

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setContentType(request.getContentType() != null ? request.getContentType() : "TEXT");

        Message created = messageRepository.save(message);

        // Update conversation updated_at
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, created);

        // Create notifications for other participants
        conversation.getParticipants().stream()
                .filter(p -> !p.getId().equals(sender.getId()))
                .forEach(participant -> notificationService.notifyUser(
                        participant,
                        "MESSAGE",
                        "New message in " + (conversation.getTitle() != null ? conversation.getTitle() : "conversation"),
                        sender.getFullName() + ": " + request.getContent(),
                        "CONVERSATION",
                        conversationId
                ));

        URI location = URI.create("/api/conversations/" + conversationId + "/messages/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{conversationId}/messages/{messageId}")
    public ResponseEntity<Message> editMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @RequestBody MessageEditRequest request,
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

        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Message message = messageOpt.get();
        if (!message.getConversation().getId().equals(conversationId)) {
            return ResponseEntity.badRequest().build();
        }

        if (!message.getSender().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        message.setContent(request.getContent());
        message.setIsEdited(true);
        message.setEditedAt(Instant.now());

        Message updated = messageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, updated);
        return ResponseEntity.ok(updated);
    }

    public static class MessageCreateRequest {
        private String content;
        private String contentType;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }
    }

    public static class MessageEditRequest {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}

