package com.sajilokaam.comment.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CommentResponse {
    private Long id;
    private Long parentCommentId;
    private String content;
    private boolean edited;
    private Instant createdAt;
    private UserSummary user;
    private List<UserSummary> mentionedUsers = new ArrayList<>();
    private List<CommentResponse> replies = new ArrayList<>();
    private List<AttachmentSummary> attachments = new ArrayList<>();
    private List<ReactionSummary> reactions = new ArrayList<>();
    private List<String> currentUserReactions = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isEdited() {
        return edited;
    }

    public void setEdited(boolean edited) {
        this.edited = edited;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public UserSummary getUser() {
        return user;
    }

    public void setUser(UserSummary user) {
        this.user = user;
    }

    public List<UserSummary> getMentionedUsers() {
        return mentionedUsers;
    }

    public void setMentionedUsers(List<UserSummary> mentionedUsers) {
        this.mentionedUsers = mentionedUsers;
    }

    public List<CommentResponse> getReplies() {
        return replies;
    }

    public void setReplies(List<CommentResponse> replies) {
        this.replies = replies;
    }

    public List<AttachmentSummary> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentSummary> attachments) {
        this.attachments = attachments;
    }

    public List<ReactionSummary> getReactions() {
        return reactions;
    }

    public void setReactions(List<ReactionSummary> reactions) {
        this.reactions = reactions;
    }

    public List<String> getCurrentUserReactions() {
        return currentUserReactions;
    }

    public void setCurrentUserReactions(List<String> currentUserReactions) {
        this.currentUserReactions = currentUserReactions;
    }

    public static class UserSummary {
        private Long id;
        private String fullName;
        private String email;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class AttachmentSummary {
        private Long id;
        private String filename;
        private String contentType;
        private long sizeBytes;
        private String downloadUrl;
        private String previewType;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFilename() {
            return filename;
        }

        public void setFilename(String filename) {
            this.filename = filename;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public long getSizeBytes() {
            return sizeBytes;
        }

        public void setSizeBytes(long sizeBytes) {
            this.sizeBytes = sizeBytes;
        }

        public String getDownloadUrl() {
            return downloadUrl;
        }

        public void setDownloadUrl(String downloadUrl) {
            this.downloadUrl = downloadUrl;
        }

        public String getPreviewType() {
            return previewType;
        }

        public void setPreviewType(String previewType) {
            this.previewType = previewType;
        }
    }

    public static class ReactionSummary {
        private String type;
        private long count;
        private String emoji;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public String getEmoji() {
            return emoji;
        }

        public void setEmoji(String emoji) {
            this.emoji = emoji;
        }
    }
}



