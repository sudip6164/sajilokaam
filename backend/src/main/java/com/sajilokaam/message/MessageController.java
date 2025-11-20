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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
    private final MessageAttachmentRepository attachmentRepository;

    public MessageController(MessageRepository messageRepository,
                             ConversationRepository conversationRepository,
                             UserRepository userRepository,
                             JwtService jwtService,
                             SimpMessagingTemplate messagingTemplate,
                             NotificationService notificationService,
                             MessageAttachmentRepository attachmentRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
        this.attachmentRepository = attachmentRepository;
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> requesterOpt = authenticate(authorization);
        if (requesterOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Conversation conversation = conversationOpt.get();
        if (!isParticipant(conversation, requesterOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messagesPage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<Message> messages = messagesPage.getContent();
        java.util.Collections.reverse(messages);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<Message> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> senderOpt = authenticate(authorization);
        if (senderOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User sender = senderOpt.get();

        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Conversation conversation = conversationOpt.get();

        if (!isParticipant(conversation, sender.getId())) {
            return ResponseEntity.status(403).build();
        }

        if ((request.getContent() == null || request.getContent().isBlank())
                && (request.getAttachmentIds() == null || request.getAttachmentIds().isEmpty())
                && (request.getRichContent() == null || request.getRichContent().isBlank())) {
            return ResponseEntity.badRequest().build();
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(
                request.getContent() != null ? request.getContent() : (request.getRichContent() != null ? request.getRichContent() : "")
        );
        message.setRichContent(request.getRichContent());

        String resolvedContentType = resolveContentType(request);
        message.setContentType(resolvedContentType);

        Message created = messageRepository.save(message);

        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<MessageAttachment> attachments = attachmentRepository.findAllById(request.getAttachmentIds());
            Set<Long> attachmentIds = new HashSet<>(request.getAttachmentIds());
            List<MessageAttachment> linked = new ArrayList<>();
            for (MessageAttachment attachment : attachments) {
                if (!attachmentIds.contains(attachment.getId())) {
                    continue;
                }
                if (!attachment.getConversation().getId().equals(conversationId)) {
                    continue;
                }
                if (attachment.getMessage() != null) {
                    continue;
                }
                attachment.setMessage(created);
                attachmentRepository.save(attachment);
                linked.add(attachment);
            }
            created.setAttachments(linked);
        }

        // Update conversation updated_at
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, created);

        final String previewContent = buildPreviewContent(request);

        // Create notifications for other participants
        conversation.getParticipants().stream()
                .filter(p -> !p.getId().equals(sender.getId()))
                .forEach(participant -> notificationService.notifyUser(
                        participant,
                        "MESSAGE",
                        "New message in " + (conversation.getTitle() != null ? conversation.getTitle() : "conversation"),
                        sender.getFullName() + ": " + previewContent,
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
        private String richContent;
        private List<Long> attachmentIds;

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

        public String getRichContent() {
            return richContent;
        }

        public void setRichContent(String richContent) {
            this.richContent = richContent;
        }

        public List<Long> getAttachmentIds() {
            return attachmentIds;
        }

        public void setAttachmentIds(List<Long> attachmentIds) {
            this.attachmentIds = attachmentIds;
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

    private String resolveContentType(MessageCreateRequest request) {
        String contentType = request.getContentType();
        boolean hasRichText = request.getRichContent() != null && !request.getRichContent().isBlank();
        boolean hasAttachments = request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty();

        if (hasAttachments) {
            return "FILE";
        }
        if (contentType != null && !contentType.isBlank()) {
            return contentType;
        }
        if (hasRichText) {
            return "RICH_TEXT";
        }
        return "TEXT";
    }

    private String buildPreviewContent(MessageCreateRequest request) {
        if (request.getContent() != null && !request.getContent().isBlank()) {
            return request.getContent();
        }
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            return "sent an attachment";
        }
        if (request.getRichContent() != null && !request.getRichContent().isBlank()) {
            return "sent a formatted message";
        }
        return "sent a message";
    }
}

