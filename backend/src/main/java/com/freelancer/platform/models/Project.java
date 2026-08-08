package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "projects")
public class Project {
    @Id
    private String id;
    
    private String clientId;
    private String clientName;
    private String title;
    private String description;
    private String projectType;
    private Double budget;
    private String deadline;
    private String status = "RECEIVED";
    private Integer progress = 10;
    private String attachmentName;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default Constructor
    public Project() {
    }

    // All Arguments Constructor
    public Project(String id, String clientId, String clientName, String title, String description, String projectType, 
                   Double budget, String deadline, String status, Integer progress, String attachmentName, LocalDateTime createdAt) {
        this.id = id;
        this.clientId = clientId;
        this.clientName = clientName;
        this.title = title;
        this.description = description;
        this.projectType = projectType;
        this.budget = budget;
        this.deadline = deadline;
        this.status = status != null ? status : "RECEIVED";
        this.progress = progress != null ? progress : 10;
        this.attachmentName = attachmentName;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder pattern
    public static ProjectBuilder builder() {
        return new ProjectBuilder();
    }

    public static class ProjectBuilder {
        private String id;
        private String clientId;
        private String clientName;
        private String title;
        private String description;
        private String projectType;
        private Double budget;
        private String deadline;
        private String status;
        private Integer progress;
        private String attachmentName;
        private LocalDateTime createdAt;

        public ProjectBuilder id(String id) {
            this.id = id;
            return this;
        }

        public ProjectBuilder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }

        public ProjectBuilder clientName(String clientName) {
            this.clientName = clientName;
            return this;
        }

        public ProjectBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ProjectBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ProjectBuilder projectType(String projectType) {
            this.projectType = projectType;
            return this;
        }

        public ProjectBuilder budget(Double budget) {
            this.budget = budget;
            return this;
        }

        public ProjectBuilder deadline(String deadline) {
            this.deadline = deadline;
            return this;
        }

        public ProjectBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ProjectBuilder progress(Integer progress) {
            this.progress = progress;
            return this;
        }

        public ProjectBuilder attachmentName(String attachmentName) {
            this.attachmentName = attachmentName;
            return this;
        }

        public ProjectBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Project build() {
            return new Project(id, clientId, clientName, title, description, projectType, budget, deadline, status, progress, attachmentName, createdAt);
        }
    }
}
