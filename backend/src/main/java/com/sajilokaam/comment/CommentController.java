package com.sajilokaam.comment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sajilokaam.auth.JwtService;
import com.sajilokaam.comment.dto.CommentResponse;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private static final int DEFAULT_HISTORY_WINDOW = 25;
    private static final int MAX_HISTORY_WINDOW = 100;

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final CommentAttachmentRepository commentAttachmentRepository;
    private final CommentReactionRepository commentReactionRepository;

    public CommentController(CommentRepository commentRepository,
                             TaskRepository taskRepository,
                             UserRepository userRepository,
                             JwtService jwtService,
                             ObjectMapper objectMapper,
                             CommentAttachmentRepository commentAttachmentRepository,
                             CommentReactionRepository commentReactionRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.commentAttachmentRepository = commentAttachmentRepository;
        this.commentReactionRepository = commentReactionRepository;
    }

    @PostMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody CommentCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        Optional<User> userOpt = resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        // Verify task exists and belongs to project
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(request.getContent().trim());

        if (request.getParentCommentId() != null) {
            commentRepository.findById(request.getParentCommentId())
                    .filter(parent -> parent.getTask().getId().equals(taskId))
                    .ifPresent(comment::setParentComment);
        }

        String mentionsJson = writeMentionsJson(request.getMentionUserIds());
        comment.setMentionsJson(mentionsJson);

        Comment created = commentRepository.save(comment);
        URI location = URI.create("/api/projects/" + projectId + "/tasks/" + taskId + "/comments/" + created.getId());

        Set<Long> userIds = new HashSet<>();
        userIds.add(user.getId());
        if (request.getMentionUserIds() != null) {
            userIds.addAll(request.getMentionUserIds());
        }
        Map<Long, User> userMap = loadUsers(userIds);

        CommentResponse response = toResponse(created, userMap,
                Collections.emptyList(),
                Collections.emptyList(),
                user.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestParam(name = "view", required = false, defaultValue = "ALL") String viewMode,
            @RequestParam(name = "filter", required = false, defaultValue = "ALL") String filterMode,
            @RequestParam(name = "limit", required = false) Integer limit,
            @RequestParam(name = "before", required = false) Instant beforeCursor) {

        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        List<Comment> comments = loadCommentsWindow(taskId, viewMode, limit, beforeCursor);
        List<Long> commentIds = comments.stream()
                .map(Comment::getId)
                .collect(Collectors.toList());

        Map<Long, List<CommentAttachment>> attachmentsByComment = loadAttachments(commentIds);
        Map<Long, List<CommentReaction>> reactionsByComment = loadReactions(commentIds);

        Long currentUserId = resolveUser(authorization)
                .map(User::getId)
                .orElse(null);

        List<CommentResponse> response = buildThreadedResponses(
                comments,
                attachmentsByComment,
                reactionsByComment,
                currentUserId);

        List<CommentResponse> filtered = applyFilter(response, filterMode, currentUserId);
        return ResponseEntity.ok(filtered);
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

    private String writeMentionsJson(List<Long> mentionUserIds) {
        if (mentionUserIds == null || mentionUserIds.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(mentionUserIds);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private List<Long> parseMentionIds(String mentionsJson) {
        if (mentionsJson == null || mentionsJson.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(mentionsJson, new TypeReference<List<Long>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private Map<Long, User> loadUsers(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
    }

    private CommentResponse.UserSummary toUserSummary(User user) {
        CommentResponse.UserSummary summary = new CommentResponse.UserSummary();
        summary.setId(user.getId());
        summary.setFullName(user.getFullName());
        summary.setEmail(user.getEmail());
        return summary;
    }

    private CommentResponse toResponse(Comment comment,
                                       Map<Long, User> userMap,
                                       List<CommentAttachment> attachments,
                                       List<CommentReaction> reactions,
                                       Long currentUserId) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setEdited(comment.isEdited());
        response.setCreatedAt(comment.getCreatedAt());
        response.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        response.setUser(toUserSummary(comment.getUser()));

        List<Long> mentionIds = parseMentionIds(comment.getMentionsJson());
        List<CommentResponse.UserSummary> mentionedUsers = mentionIds.stream()
                .map(userMap::get)
                .filter(Objects::nonNull)
                .map(this::toUserSummary)
                .collect(Collectors.toList());
        response.setMentionedUsers(mentionedUsers);

        response.setAttachments(buildAttachmentSummaries(comment, attachments));
        response.setReactions(buildReactionSummaries(reactions));
        response.setCurrentUserReactions(extractCurrentUserReactions(reactions, currentUserId));

        return response;
    }

    private List<CommentResponse> buildThreadedResponses(List<Comment> comments,
                                                         Map<Long, List<CommentAttachment>> attachmentsByComment,
                                                         Map<Long, List<CommentReaction>> reactionsByComment,
                                                         Long currentUserId) {
        if (comments.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = new HashSet<>();
        for (Comment comment : comments) {
            if (comment.getUser() != null) {
                userIds.add(comment.getUser().getId());
            }
            userIds.addAll(parseMentionIds(comment.getMentionsJson()));
        }
        Map<Long, User> userMap = loadUsers(userIds);

        Map<Long, CommentResponse> responseById = new HashMap<>();
        for (Comment comment : comments) {
            List<CommentAttachment> attachments = attachmentsByComment
                    .getOrDefault(comment.getId(), Collections.emptyList());
            List<CommentReaction> reactions = reactionsByComment
                    .getOrDefault(comment.getId(), Collections.emptyList());
            responseById.put(comment.getId(),
                    toResponse(comment, userMap, attachments, reactions, currentUserId));
        }

        List<CommentResponse> roots = new ArrayList<>();
        for (Comment comment : comments) {
            CommentResponse response = responseById.get(comment.getId());
            Comment parent = comment.getParentComment();
            if (parent != null) {
                CommentResponse parentResponse = responseById.get(parent.getId());
                if (parentResponse != null) {
                    parentResponse.getReplies().add(response);
                } else {
                    roots.add(response);
                }
            } else {
                roots.add(response);
            }
        }

        roots.sort(Comparator.comparing(CommentResponse::getCreatedAt));
        roots.forEach(this::sortReplies);
        return roots;
    }

    private void sortReplies(CommentResponse response) {
        if (response.getReplies() == null || response.getReplies().isEmpty()) {
            return;
        }
        response.getReplies().sort(Comparator.comparing(CommentResponse::getCreatedAt));
        response.getReplies().forEach(this::sortReplies);
    }

    private Map<Long, List<CommentAttachment>> loadAttachments(List<Long> commentIds) {
        if (commentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return commentAttachmentRepository.findByCommentIdIn(commentIds).stream()
                .collect(Collectors.groupingBy(attachment -> attachment.getComment().getId()));
    }

    private Map<Long, List<CommentReaction>> loadReactions(List<Long> commentIds) {
        if (commentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return commentReactionRepository.findByCommentIdIn(commentIds).stream()
                .collect(Collectors.groupingBy(reaction -> reaction.getComment().getId()));
    }

    private List<Comment> loadCommentsWindow(Long taskId,
                                             String viewMode,
                                             Integer limit,
                                             Instant beforeCursor) {
        boolean useWindow = viewMode != null && !"ALL".equalsIgnoreCase(viewMode);
        if (!useWindow) {
            return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        }

        int pageSize = resolveLimit(limit);
        Pageable pageable = PageRequest.of(0, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Comment> page = beforeCursor != null
                ? commentRepository.findByTaskIdAndCreatedAtBefore(taskId, beforeCursor, pageable)
                : commentRepository.findByTaskId(taskId, pageable);

        List<Comment> comments = new ArrayList<>(page.getContent());
        comments.sort(Comparator.comparing(Comment::getCreatedAt));
        return comments;
    }

    private int resolveLimit(Integer requestedLimit) {
        if (requestedLimit == null || requestedLimit <= 0) {
            return DEFAULT_HISTORY_WINDOW;
        }
        return Math.min(requestedLimit, MAX_HISTORY_WINDOW);
    }

    private List<CommentResponse> applyFilter(List<CommentResponse> responses,
                                              String filterMode,
                                              Long currentUserId) {
        if (responses.isEmpty() || filterMode == null || "ALL".equalsIgnoreCase(filterMode)) {
            return responses;
        }

        if ("MENTIONS".equalsIgnoreCase(filterMode) && currentUserId != null) {
            return filterResponses(responses, response ->
                    response.getMentionedUsers().stream()
                            .anyMatch(user -> Objects.equals(user.getId(), currentUserId)));
        }

        if ("ATTACHMENTS".equalsIgnoreCase(filterMode)) {
            return filterResponses(responses, response ->
                    response.getAttachments() != null && !response.getAttachments().isEmpty());
        }

        return responses;
    }

    private List<CommentResponse> filterResponses(List<CommentResponse> roots,
                                                  Predicate<CommentResponse> predicate) {
        List<CommentResponse> filtered = new ArrayList<>();
        for (CommentResponse response : roots) {
            CommentResponse filteredNode = filterNode(response, predicate);
            if (filteredNode != null) {
                filtered.add(filteredNode);
            }
        }
        return filtered;
    }

    private CommentResponse filterNode(CommentResponse node,
                                       Predicate<CommentResponse> predicate) {
        if (node == null) {
            return null;
        }

        List<CommentResponse> filteredReplies = new ArrayList<>();
        if (node.getReplies() != null) {
            for (CommentResponse child : node.getReplies()) {
                CommentResponse filteredChild = filterNode(child, predicate);
                if (filteredChild != null) {
                    filteredReplies.add(filteredChild);
                }
            }
        }

        boolean matches = predicate.test(node);
        if (matches || !filteredReplies.isEmpty()) {
            node.setReplies(filteredReplies);
            return node;
        }
        return null;
    }

    private List<CommentResponse.AttachmentSummary> buildAttachmentSummaries(Comment comment,
                                                                             List<CommentAttachment> attachments) {
        if (attachments.isEmpty()) {
            return Collections.emptyList();
        }

        Long projectId = comment.getTask().getProject().getId();
        Long taskId = comment.getTask().getId();

        return attachments.stream()
                .map(attachment -> {
                    CommentResponse.AttachmentSummary summary = new CommentResponse.AttachmentSummary();
                    summary.setId(attachment.getId());
                    summary.setFilename(attachment.getFilename());
                    summary.setContentType(attachment.getContentType());
                    summary.setSizeBytes(attachment.getSizeBytes());
                    summary.setDownloadUrl(
                            CommentAttachmentController.buildDownloadPath(projectId, taskId, comment.getId(), attachment.getId())
                    );
                    summary.setPreviewType(determinePreviewType(attachment.getContentType()));
                    return summary;
                })
                .collect(Collectors.toList());
    }

    private String determinePreviewType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "FILE";
        }
        if (contentType.startsWith("image/")) {
            return "IMAGE";
        }
        if (contentType.startsWith("video/")) {
            return "VIDEO";
        }
        if (contentType.startsWith("audio/")) {
            return "AUDIO";
        }
        return "FILE";
    }

    private List<CommentResponse.ReactionSummary> buildReactionSummaries(List<CommentReaction> reactions) {
        if (reactions.isEmpty()) {
            return Collections.emptyList();
        }

        Map<CommentReactionType, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(CommentReaction::getReactionType, Collectors.counting()));

        return counts.entrySet().stream()
                .sorted(Map.Entry.<CommentReactionType, Long>comparingByValue().reversed())
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
                .filter(reaction -> reaction.getUser() != null && reaction.getUser().getId().equals(currentUserId))
                .map(reaction -> reaction.getReactionType().name())
                .distinct()
                .collect(Collectors.toList());
    }
}

