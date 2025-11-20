package com.sajilokaam.message;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
    List<MessageAttachment> findByConversationIdAndMessageIsNull(Long conversationId);
}


