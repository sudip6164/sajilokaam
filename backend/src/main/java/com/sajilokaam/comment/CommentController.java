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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public CommentController(CommentRepository commentRepository,
                             TaskRepository taskRepository,
                             UserRepository userRepository,
                             JwtService jwtService,
                             ObjectMapper objectMapper) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody CommentCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
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

        CommentResponse response = toResponse(created, userMap);
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long projectId,
            @PathVariable Long taskId) {
        
        // Verify task exists and belongs to project
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!task.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().build();
        }

        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        List<CommentResponse> response = buildThreadedResponses(comments);
        return ResponseEntity.ok(response);
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

    private CommentResponse toResponse(Comment comment, Map<Long, User> userMap) {
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

        return response;
    }

    private List<CommentResponse> buildThreadedResponses(List<Comment> comments) {
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
            responseById.put(comment.getId(), toResponse(comment, userMap));
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
}

