package com.sajilokaam.directmessage;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    List<DirectMessage> findBySenderIdAndReceiverIdOrderByCreatedAtAsc(Long senderId, Long receiverId);
    List<DirectMessage> findByReceiverIdAndSenderIdOrderByCreatedAtAsc(Long receiverId, Long senderId);
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}

