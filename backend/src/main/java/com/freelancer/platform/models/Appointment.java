package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;
    
    private String clientId;
    private String clientName;
    private String clientEmail;
    private String title;
    private String date;        // yyyy-MM-dd format
    private String timeSlot;    // HH:mm format or Slot name e.g. "10:00 AM - 11:00 AM"
    private String description;
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default Constructor
    public Appointment() {
    }

    // All Arguments Constructor
    public Appointment(String id, String clientId, String clientName, String clientEmail, String title, 
                       String date, String timeSlot, String description, String status, LocalDateTime createdAt) {
        this.id = id;
        this.clientId = clientId;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.title = title;
        this.date = date;
        this.timeSlot = timeSlot;
        this.description = description;
        this.status = status != null ? status : "CONFIRMED";
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

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
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

    // Builder pattern
    public static AppointmentBuilder builder() {
        return new AppointmentBuilder();
    }

    public static class AppointmentBuilder {
        private String id;
        private String clientId;
        private String clientName;
        private String clientEmail;
        private String title;
        private String date;
        private String timeSlot;
        private String description;
        private String status;
        private LocalDateTime createdAt;

        public AppointmentBuilder id(String id) {
            this.id = id;
            return this;
        }

        public AppointmentBuilder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }

        public AppointmentBuilder clientName(String clientName) {
            this.clientName = clientName;
            return this;
        }

        public AppointmentBuilder clientEmail(String clientEmail) {
            this.clientEmail = clientEmail;
            return this;
        }

        public AppointmentBuilder title(String title) {
            this.title = title;
            return this;
        }

        public AppointmentBuilder date(String date) {
            this.date = date;
            return this;
        }

        public AppointmentBuilder timeSlot(String timeSlot) {
            this.timeSlot = timeSlot;
            return this;
        }

        public AppointmentBuilder description(String description) {
            this.description = description;
            return this;
        }

        public AppointmentBuilder status(String status) {
            this.status = status;
            return this;
        }

        public AppointmentBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Appointment build() {
            return new Appointment(id, clientId, clientName, clientEmail, title, date, timeSlot, description, status, createdAt);
        }
    }
}
