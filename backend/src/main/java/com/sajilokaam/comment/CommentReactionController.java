package com.sajilokaam.comment;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.comment.dto.CommentReactionRequest;
import com.sajilokaam.comment.dto.CommentReactionResponse;
import com.sajilokaam.comment.dto.CommentResponse;
import com.sajilokaam.task.Task;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentReactionController {

    private final CommentRepository commentRepository;
    private final CommentReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public CommentReactionController(CommentRepository commentRepository,
                                     CommentReactionRepository reactionRepository,
                                     UserRepository userRepository,
                                     JwtService jwtService) {
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/{projectId}/tasks/{taskId}/comments/{commentId}/reactions")
    public ResponseEntity<CommentReactionResponse> toggleReaction(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @RequestBody CommentReactionRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {

        Optional<User> userOpt = resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comment comment = commentOpt.get();
        Task task = comment.getTask();
        if (!task.getId().equals(taskId) || !task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request == null || request.getReactionType() == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<CommentReactionType> reactionTypeOpt = CommentReactionType.fromValue(request.getReactionType());
        if (reactionTypeOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        CommentReactionType reactionType = reactionTypeOpt.get();

        Optional<CommentReaction> existing = reactionRepository
                .findByCommentIdAndUserIdAndReactionType(commentId, user.getId(), reactionType);

        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
        } else {
            CommentReaction reaction = new CommentReaction();
            reaction.setComment(comment);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            reactionRepository.save(reaction);
        }

        List<CommentReaction> reactions = reactionRepository.findByCommentId(commentId);
        CommentReactionResponse response = buildReactionResponse(commentId, reactions, user.getId());
        return ResponseEntity.ok(response);
    }

    private Optional<User> resolveUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Optional.empty();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return Optional.empty();
        }

        return userRepository.findByEmail(emailOpt.get());
    }

    private CommentReactionResponse buildReactionResponse(Long commentId,
                                                          List<CommentReaction> reactions,
                                                          Long currentUserId) {
        CommentReactionResponse response = new CommentReactionResponse();
        response.setCommentId(commentId);
        response.setReactions(buildReactionSummaries(reactions));
        response.setCurrentUserReactions(extractCurrentUserReactions(reactions, currentUserId));
        return response;
    }

    private List<CommentResponse.ReactionSummary> buildReactionSummaries(List<CommentReaction> reactions) {
        if (reactions.isEmpty()) {
            return Collections.emptyList();
        }

        return reactions.stream()
                .collect(Collectors.groupingBy(CommentReaction::getReactionType, Collectors.counting()))
                .entrySet().stream()
                .sorted(java.util.Map.Entry.<CommentReactionType, Long>comparingByValue().reversed())
                .map(entry -> {
                    CommentResponse.ReactionSummary summary = new CommentResponse.ReactionSummary();
                    summary.setType(entry.getKey().name());
                    summary.setEmoji(entry.getKey().getEmoji());
                    summary.setCount(entry.getValue());
                    return summary;
                })
                .collect(Collectors.toList());
    }

    private List<String> extractCurrentUserReactions(List<CommentReaction> reactions, Long currentUserId) {
        if (currentUserId == null || reactions.isEmpty()) {
            return Collections.emptyList();
        }

        return reactions.stream()
                .filter(reaction -> reaction.getUser() != null && Objects.equals(reaction.getUser().getId(), currentUserId))
                .map(reaction -> reaction.getReactionType().name())
                .distinct()
                .collect(Collectors.toList());
    }
}


