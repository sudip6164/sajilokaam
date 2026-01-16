package com.sajilokaam.conversation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByProjectId(Long projectId);
    
    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId")
    List<Conversation> findByParticipantsContaining(@Param("userId") Long userId);
}

