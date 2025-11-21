package com.sajilokaam.comment;

import com.sajilokaam.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "comment_reactions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_comment_reaction", columnNames = {"comment_id", "user_id", "reaction_type"})
}, indexes = {
        @Index(name = "idx_comment_reactions_comment", columnList = "comment_id")
})
public class CommentReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 50)
    private CommentReactionType reactionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public CommentReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(CommentReactionType reactionType) {
        this.reactionType = reactionType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}


