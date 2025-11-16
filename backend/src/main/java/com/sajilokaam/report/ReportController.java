package com.sajilokaam.report;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.task.Task;
import com.sajilokaam.task.TaskRepository;
import com.sajilokaam.timelog.TimeLog;
import com.sajilokaam.timelog.TimeLogRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;
    private final JwtService jwtService;

    public ReportController(ProjectRepository projectRepository, TaskRepository taskRepository,
                            TimeLogRepository timeLogRepository, JwtService jwtService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.timeLogRepository = timeLogRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/projects/{projectId}/csv")
    public ResponseEntity<byte[]> exportProjectReport(
            @PathVariable Long projectId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = projectOpt.get();
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8);

            // Write CSV header
            writer.println("Project Report: " + project.getTitle());
            writer.println("Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            writer.println();
            writer.println("Project Details");
            writer.println("Title," + escapeCsv(project.getTitle()));
            writer.println("Description," + escapeCsv(project.getDescription() != null ? project.getDescription() : ""));
            writer.println("Created," + project.getCreatedAt().toString());
            writer.println();
            
            // Tasks section
            writer.println("Tasks");
            writer.println("ID,Title,Status,Assignee,Due Date,Created At");
            for (Task task : tasks) {
                writer.println(String.format("%d,%s,%s,%s,%s,%s",
                    task.getId(),
                    escapeCsv(task.getTitle()),
                    task.getStatus(),
                    task.getAssignee() != null ? escapeCsv(task.getAssignee().getFullName()) : "Unassigned",
                    task.getDueDate() != null ? task.getDueDate().toString() : "",
                    task.getCreatedAt().toString()
                ));
            }
            writer.println();

            // Time logs section
            writer.println("Time Logs");
            writer.println("Task ID,Task Title,User,Minutes,Hours,Logged At");
            for (Task task : tasks) {
                List<TimeLog> timeLogs = timeLogRepository.findByTaskId(task.getId());
                for (TimeLog timeLog : timeLogs) {
                    double hours = timeLog.getMinutes() / 60.0;
                    writer.println(String.format("%d,%s,%s,%d,%.2f,%s",
                        task.getId(),
                        escapeCsv(task.getTitle()),
                        escapeCsv(timeLog.getUser().getFullName()),
                        timeLog.getMinutes(),
                        hours,
                        timeLog.getLoggedAt().toString()
                    ));
                }
            }

            writer.close();
            byte[] csvBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", 
                "project_" + projectId + "_report_" + System.currentTimeMillis() + ".csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/projects/{projectId}/tasks/csv")
    public ResponseEntity<byte[]> exportTasksReport(
            @PathVariable Long projectId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Task> tasks = taskRepository.findByProjectId(projectId);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8);

            writer.println("Tasks Report - Project: " + projectOpt.get().getTitle());
            writer.println("Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            writer.println();
            writer.println("ID,Title,Description,Status,Assignee,Due Date,Created At");
            
            for (Task task : tasks) {
                writer.println(String.format("%d,%s,%s,%s,%s,%s,%s",
                    task.getId(),
                    escapeCsv(task.getTitle()),
                    escapeCsv(task.getDescription() != null ? task.getDescription() : ""),
                    task.getStatus(),
                    task.getAssignee() != null ? escapeCsv(task.getAssignee().getFullName()) : "Unassigned",
                    task.getDueDate() != null ? task.getDueDate().toString() : "",
                    task.getCreatedAt().toString()
                ));
            }

            writer.close();
            byte[] csvBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", 
                "tasks_report_" + projectId + "_" + System.currentTimeMillis() + ".csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/projects/{projectId}/time-logs/csv")
    public ResponseEntity<byte[]> exportTimeLogsReport(
            @PathVariable Long projectId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Task> tasks = taskRepository.findByProjectId(projectId);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8);

            writer.println("Time Logs Report - Project: " + projectOpt.get().getTitle());
            writer.println("Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            writer.println();
            writer.println("Task ID,Task Title,User,Minutes,Hours,Logged At");
            
            for (Task task : tasks) {
                List<TimeLog> timeLogs = timeLogRepository.findByTaskId(task.getId());
                for (TimeLog timeLog : timeLogs) {
                    double hours = timeLog.getMinutes() / 60.0;
                    writer.println(String.format("%d,%s,%s,%d,%.2f,%s",
                        task.getId(),
                        escapeCsv(task.getTitle()),
                        escapeCsv(timeLog.getUser().getFullName()),
                        timeLog.getMinutes(),
                        hours,
                        timeLog.getLoggedAt().toString()
                    ));
                }
            }

            writer.close();
            byte[] csvBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment", 
                "time_logs_report_" + projectId + "_" + System.currentTimeMillis() + ".csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/projects/{projectId}/pdf")
    public ResponseEntity<byte[]> exportProjectReportPdf(
            @PathVariable Long projectId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = projectOpt.get();
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        try {
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            PDType1Font titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font headingFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font normalFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float margin = 50;
            float yPosition = 750;
            float lineHeight = 15;
            float titleFontSize = 16;
            float headingFontSize = 12;
            float normalFontSize = 10;

            // Title
            contentStream.beginText();
            contentStream.setFont(titleFont, titleFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Project Report: " + project.getTitle());
            contentStream.endText();
            yPosition -= lineHeight * 2;

            // Generated date
            contentStream.beginText();
            contentStream.setFont(normalFont, normalFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            contentStream.endText();
            yPosition -= lineHeight * 2;

            // Project Details
            contentStream.beginText();
            contentStream.setFont(headingFont, headingFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Project Details");
            contentStream.endText();
            yPosition -= lineHeight * 1.5f;

            contentStream.beginText();
            contentStream.setFont(normalFont, normalFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Title: " + project.getTitle());
            contentStream.endText();
            yPosition -= lineHeight;

            if (project.getDescription() != null && !project.getDescription().isEmpty()) {
                String description = project.getDescription();
                if (description.length() > 80) {
                    description = description.substring(0, 77) + "...";
                }
                contentStream.beginText();
                contentStream.setFont(normalFont, normalFontSize);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Description: " + description);
                contentStream.endText();
                yPosition -= lineHeight;
            }

            contentStream.beginText();
            contentStream.setFont(normalFont, normalFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Created: " + project.getCreatedAt().toString());
            contentStream.endText();
            yPosition -= lineHeight * 2;

            // Tasks Section
            if (yPosition < 100) {
                contentStream.close();
                page = new PDPage();
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                yPosition = 750;
            }

            contentStream.beginText();
            contentStream.setFont(headingFont, headingFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Tasks (" + tasks.size() + ")");
            contentStream.endText();
            yPosition -= lineHeight * 1.5f;

            for (Task task : tasks) {
                if (yPosition < 50) {
                    contentStream.close();
                    page = new PDPage();
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    yPosition = 750;
                }

                contentStream.beginText();
                contentStream.setFont(normalFont, normalFontSize);
                contentStream.newLineAtOffset(margin, yPosition);
                String taskText = String.format("%d. %s - %s", task.getId(), task.getTitle(), task.getStatus());
                if (taskText.length() > 90) {
                    taskText = taskText.substring(0, 87) + "...";
                }
                contentStream.showText(taskText);
                contentStream.endText();
                yPosition -= lineHeight;
            }

            contentStream.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            document.close();

            byte[] pdfBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "project_" + projectId + "_report_" + System.currentTimeMillis() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

