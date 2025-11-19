package com.sajilokaam.notification;

import com.sajilokaam.notification.dto.NotificationPayload;
import com.sajilokaam.user.User;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification notifyUser(User user,
                                   String type,
                                   String title,
                                   String message,
                                   String entityType,
                                   Long entityId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);

        Notification saved = notificationRepository.save(notification);
        sendToWebSocket(saved);
        return saved;
    }

    public void sendToWebSocket(Notification notification) {
        NotificationPayload payload = toPayload(notification);
        messagingTemplate.convertAndSend("/queue/notifications/" + notification.getUser().getId(), payload);
    }

    public NotificationPayload toPayload(Notification notification) {
        NotificationPayload payload = new NotificationPayload();
        payload.setId(notification.getId());
        payload.setType(notification.getType());
        payload.setTitle(notification.getTitle());
        payload.setMessage(notification.getMessage());
        payload.setEntityType(notification.getEntityType());
        payload.setEntityId(notification.getEntityId());
        payload.setIsRead(notification.getIsRead());
        payload.setCreatedAt(notification.getCreatedAt());
        return payload;
    }
}


