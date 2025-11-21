package com.sajilokaam.comment.dto;

import java.util.ArrayList;
import java.util.List;

public class CommentReactionResponse {
    private Long commentId;
    private List<CommentResponse.ReactionSummary> reactions = new ArrayList<>();
    private List<String> currentUserReactions = new ArrayList<>();

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public List<CommentResponse.ReactionSummary> getReactions() {
        return reactions;
    }

    public void setReactions(List<CommentResponse.ReactionSummary> reactions) {
        this.reactions = reactions;
    }

    public List<String> getCurrentUserReactions() {
        return currentUserReactions;
    }

    public void setCurrentUserReactions(List<String> currentUserReactions) {
        this.currentUserReactions = currentUserReactions;
    }
}


