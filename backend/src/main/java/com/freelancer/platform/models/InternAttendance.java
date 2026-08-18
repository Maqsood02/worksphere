package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "intern_attendance")
public class InternAttendance {

    @Id
    private String id;
    private String logId;
    private String username;
    private String date;
    private String time;
    private Integer hours;
    private String summary;
    private String status; // SUBMITTED, APPROVED, REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InternAttendance() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public InternAttendance(String logId, String username, String date, String time, Integer hours, String summary, String status) {
        this.logId = logId;
        this.username = username;
        this.date = date;
        this.time = time;
        this.hours = hours;
        this.summary = summary;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLogId() {
        return logId != null ? logId : id;
    }

    public void setLogId(String logId) {
        this.logId = logId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getHours() {
        return hours != null ? hours : 8;
    }

    public void setHours(Integer hours) {
        this.hours = hours;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getStatus() {
        return status != null ? status : "SUBMITTED";
    }

    public void setStatus(String status) {
        this.status = status;
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
}
