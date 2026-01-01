package com.sajilokaam.file.dto;

import java.time.Instant;

public class FileResponse {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private UploadedBy uploadedBy;
    private String createdAt;

    public FileResponse() {}

    public FileResponse(Long id, String fileName, String fileUrl, Long fileSize, UploadedBy uploadedBy, Instant createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt != null ? createdAt.toString() : null;
    }

    public static class UploadedBy {
        private Long id;
        private String fullName;

        public UploadedBy() {}

        public UploadedBy(Long id, String fullName) {
            this.id = id;
            this.fullName = fullName;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public UploadedBy getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(UploadedBy uploadedBy) { this.uploadedBy = uploadedBy; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

