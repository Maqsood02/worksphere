package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    
    private String senderId;     // Username or "admin" or "ai"
    private String senderName;   // Human-readable sender name
    private String receiverId;   // Destination user ("admin" or client username)
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
    private Boolean isRead = false;
    private Boolean isAi = false;

    // Default Constructor
    public Message() {
    }

    // All Arguments Constructor
    public Message(String id, String senderId, String senderName, String receiverId, String content, 
                   LocalDateTime timestamp, Boolean isRead, Boolean isAi) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.isRead = isRead != null ? isRead : false;
        this.isAi = isAi != null ? isAi : false;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Boolean getIsAi() {
        return isAi;
    }

    public void setIsAi(Boolean isAi) {
        this.isAi = isAi;
    }

    // Builder pattern
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public static class MessageBuilder {
        private String id;
        private String senderId;
        private String senderName;
        private String receiverId;
        private String content;
        private LocalDateTime timestamp;
        private Boolean isRead;
        private Boolean isAi;

        public MessageBuilder id(String id) {
            this.id = id;
            return this;
        }

        public MessageBuilder senderId(String senderId) {
            this.senderId = senderId;
            return this;
        }

        public MessageBuilder senderName(String senderName) {
            this.senderName = senderName;
            return this;
        }

        public MessageBuilder receiverId(String receiverId) {
            this.receiverId = receiverId;
            return this;
        }

        public MessageBuilder content(String content) {
            this.content = content;
            return this;
        }

        public MessageBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public MessageBuilder isRead(Boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public MessageBuilder isAi(Boolean isAi) {
            this.isAi = isAi;
            return this;
        }

        public Message build() {
            return new Message(id, senderId, senderName, receiverId, content, timestamp, isRead, isAi);
        }
    }
}
