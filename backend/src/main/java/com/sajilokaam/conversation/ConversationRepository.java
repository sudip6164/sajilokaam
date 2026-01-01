package com.sajilokaam.conversation;

import com.sajilokaam.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByProjectId(Long projectId);
    List<Conversation> findByParticipantsContaining(User user);
}

