package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    
    private String projectId;
    private String projectTitle;
    private String clientId;
    private String clientName;
    private Double amount;
    private String dueDate;
    private String status = "UNPAID"; // UNPAID, PAID
    private String paymentMethod;     // Stripe, PayPal, Razorpay, UPI etc.
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default Constructor
    public Invoice() {
    }

    // All Arguments Constructor
    public Invoice(String id, String projectId, String projectTitle, String clientId, String clientName, 
                   Double amount, String dueDate, String status, String paymentMethod, LocalDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.projectTitle = projectTitle;
        this.clientId = clientId;
        this.clientName = clientName;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status != null ? status : "UNPAID";
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder pattern
    public static InvoiceBuilder builder() {
        return new InvoiceBuilder();
    }

    public static class InvoiceBuilder {
        private String id;
        private String projectId;
        private String projectTitle;
        private String clientId;
        private String clientName;
        private Double amount;
        private String dueDate;
        private String status;
        private String paymentMethod;
        private LocalDateTime createdAt;

        public InvoiceBuilder id(String id) {
            this.id = id;
            return this;
        }

        public InvoiceBuilder projectId(String projectId) {
            this.projectId = projectId;
            return this;
        }

        public InvoiceBuilder projectTitle(String projectTitle) {
            this.projectTitle = projectTitle;
            return this;
        }

        public InvoiceBuilder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }

        public InvoiceBuilder clientName(String clientName) {
            this.clientName = clientName;
            return this;
        }

        public InvoiceBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public InvoiceBuilder dueDate(String dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public InvoiceBuilder status(String status) {
            this.status = status;
            return this;
        }

        public InvoiceBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public InvoiceBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Invoice build() {
            return new Invoice(id, projectId, projectTitle, clientId, clientName, amount, dueDate, status, paymentMethod, createdAt);
        }
    }
}
