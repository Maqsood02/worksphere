package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "intern_tasks")
public class InternTask {

    @Id
    private String id;
    private String taskId;
    private String assignedTo;
    private String title;
    private String description;
    private String deadline;
    private String priority; // HIGH, MEDIUM, LOW
    private String status;   // IN_PROGRESS, SUBMITTED, COMPLETED, PENDING
    private String submissionUrl;
    private String submissionNotes;
    private String adminFeedback;
    private List<String> requiredDeliverables;
    private Object submittedFiles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InternTask() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public InternTask(String taskId, String assignedTo, String title, String description, String deadline, String priority, String status) {
        this.taskId = taskId;
        this.assignedTo = assignedTo;
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.priority = priority;
        this.status = status;
        this.submissionUrl = "";
        this.submissionNotes = "";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId != null ? taskId : id;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
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

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public String getSubmissionUrl() {
        return submissionUrl;
    }

    public void setSubmissionUrl(String submissionUrl) {
        this.submissionUrl = submissionUrl;
    }

    public String getSubmissionNotes() {
        return submissionNotes;
    }

    public void setSubmissionNotes(String submissionNotes) {
        this.submissionNotes = submissionNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAdminFeedback() {
        return adminFeedback;
    }

    public void setAdminFeedback(String adminFeedback) {
        this.adminFeedback = adminFeedback;
    }

    public List<String> getRequiredDeliverables() {
        return requiredDeliverables;
    }

    public void setRequiredDeliverables(List<String> requiredDeliverables) {
        this.requiredDeliverables = requiredDeliverables;
    }

    public Object getSubmittedFiles() {
        return submittedFiles;
    }

    public void setSubmittedFiles(Object submittedFiles) {
        this.submittedFiles = submittedFiles;
    }
}
