package com.sajilokaam.tasklink;

import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskLinkController {
    private final TaskLinkRepository taskLinkRepository;
    private final TaskRepository taskRepository;

    public TaskLinkController(TaskLinkRepository taskLinkRepository, TaskRepository taskRepository) {
        this.taskLinkRepository = taskLinkRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/{taskId}/links")
    public ResponseEntity<List<TaskLink>> getTaskLinks(@PathVariable Long taskId) {
        List<TaskLink> links = taskLinkRepository.findByTaskId(taskId);
        return ResponseEntity.ok(links);
    }

    @PostMapping("/{taskId}/links")
    public ResponseEntity<TaskLink> createLink(
            @PathVariable Long taskId,
            @RequestBody TaskLinkCreateRequest request) {
        if (!taskRepository.existsById(taskId) || 
            !taskRepository.existsById(request.getLinkedTaskId())) {
            return ResponseEntity.notFound().build();
        }

        if (taskId.equals(request.getLinkedTaskId())) {
            return ResponseEntity.badRequest().build();
        }

        Task task = taskRepository.findById(taskId).orElseThrow();
        Task linkedTask = taskRepository.findById(request.getLinkedTaskId()).orElseThrow();

        TaskLink link = new TaskLink();
        link.setTask(task);
        link.setLinkedTask(linkedTask);
        link.setLinkType(request.getLinkType() != null ? request.getLinkType() : "RELATES_TO");

        TaskLink created = taskLinkRepository.save(link);
        URI location = URI.create("/api/tasks/" + taskId + "/links/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @DeleteMapping("/{taskId}/links/{linkId}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable Long taskId,
            @PathVariable Long linkId) {
        return taskLinkRepository.findById(linkId)
                .map(link -> {
                    if (!link.getTask().getId().equals(taskId)) {
                        return ResponseEntity.badRequest().<Void>build();
                    }
                    taskLinkRepository.delete(link);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class TaskLinkCreateRequest {
        private Long linkedTaskId;
        private String linkType;

        public Long getLinkedTaskId() {
            return linkedTaskId;
        }

        public void setLinkedTaskId(Long linkedTaskId) {
            this.linkedTaskId = linkedTaskId;
        }

        public String getLinkType() {
            return linkType;
        }

        public void setLinkType(String linkType) {
            this.linkType = linkType;
        }
    }
}

