package com.sajilokaam.comment;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class CommentCreateRequest {
    @NotBlank(message = "Comment content is required")
    private String content;

    private Long parentCommentId;

    private List<Long> mentionUserIds;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public List<Long> getMentionUserIds() {
        return mentionUserIds;
    }

    public void setMentionUserIds(List<Long> mentionUserIds) {
        this.mentionUserIds = mentionUserIds;
    }
}

