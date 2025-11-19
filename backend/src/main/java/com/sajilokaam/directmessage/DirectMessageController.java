package com.sajilokaam.directmessage;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.notification.NotificationService;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/direct-messages")
@CrossOrigin(origins = "http://localhost:5173")
public class DirectMessageController {
    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public DirectMessageController(DirectMessageRepository directMessageRepository,
                                  UserRepository userRepository,
                                  JwtService jwtService,
                                  SimpMessagingTemplate messagingTemplate,
                                  NotificationService notificationService) {
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<DirectMessage>> getConversation(
            @PathVariable Long userId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> currentUserOpt = userRepository.findByEmail(emailOpt.get());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = currentUserOpt.get();

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }

        // Get messages in both directions
        List<DirectMessage> messages1 = directMessageRepository.findBySenderIdAndReceiverIdOrderByCreatedAtAsc(
                currentUser.getId(), userId);
        List<DirectMessage> messages2 = directMessageRepository.findByReceiverIdAndSenderIdOrderByCreatedAtAsc(
                currentUser.getId(), userId);

        // Combine and sort
        List<DirectMessage> allMessages = new java.util.ArrayList<>();
        allMessages.addAll(messages1);
        allMessages.addAll(messages2);
        allMessages.sort((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()));

        return ResponseEntity.ok(allMessages);
    }

    @PostMapping("/{receiverId}")
    public ResponseEntity<DirectMessage> sendMessage(
            @PathVariable Long receiverId,
            @RequestBody DirectMessageCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> senderOpt = userRepository.findByEmail(emailOpt.get());
        if (senderOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User sender = senderOpt.get();

        Optional<User> receiverOpt = userRepository.findById(receiverId);
        if (receiverOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User receiver = receiverOpt.get();

        DirectMessage message = new DirectMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setContentType(request.getContentType() != null ? request.getContentType() : "TEXT");

        DirectMessage created = directMessageRepository.save(message);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/queue/messages/" + receiverId, created);
        messagingTemplate.convertAndSend("/queue/messages/" + sender.getId(), created);

        // Create notification
        notificationService.notifyUser(
                receiver,
                "MESSAGE",
                "New message from " + sender.getFullName(),
                request.getContent(),
                "USER",
                sender.getId()
        );

        URI location = URI.create("/api/direct-messages/" + receiverId + "/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{messageId}/read")
    public ResponseEntity<DirectMessage> markAsRead(
            @PathVariable Long messageId,
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

        Optional<DirectMessage> messageOpt = directMessageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DirectMessage message = messageOpt.get();
        if (!message.getReceiver().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        message.setIsRead(true);
        message.setReadAt(Instant.now());
        DirectMessage updated = directMessageRepository.save(message);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.ok(0L);
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.ok(0L);
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(0L);
        }

        long count = directMessageRepository.countByReceiverIdAndIsReadFalse(userOpt.get().getId());
        return ResponseEntity.ok(count);
    }

    public static class DirectMessageCreateRequest {
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
}

