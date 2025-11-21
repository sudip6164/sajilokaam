package com.sajilokaam.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CommentAttachmentRepository extends JpaRepository<CommentAttachment, Long> {
    List<CommentAttachment> findByCommentIdIn(Collection<Long> commentIds);
}


