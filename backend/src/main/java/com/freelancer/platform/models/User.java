package com.freelancer.platform.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;
    private String rawPassword;
    private String name;
    private String email;
    private String phone;
    private String role; // ROLE_CLIENT, ROLE_ADMIN, ROLE_INTERN
    private boolean emailVerified = false;
    private boolean phoneVerified = false;
    private String emailOtp;
    private String phoneOtp;
    private LocalDateTime otpExpiry;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default Constructor
    public User() {
    }

    // All Arguments Constructor
    public User(String id, String username, String password, String rawPassword, String name, String email, String phone, String role, boolean emailVerified, boolean phoneVerified, String emailOtp, String phoneOtp, LocalDateTime otpExpiry, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.rawPassword = rawPassword;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.emailVerified = emailVerified;
        this.phoneVerified = phoneVerified;
        this.emailOtp = emailOtp;
        this.phoneOtp = phoneOtp;
        this.otpExpiry = otpExpiry;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRawPassword() {
        return rawPassword;
    }

    public void setRawPassword(String rawPassword) {
        this.rawPassword = rawPassword;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public String getEmailOtp() {
        return emailOtp;
    }

    public void setEmailOtp(String emailOtp) {
        this.emailOtp = emailOtp;
    }

    public String getPhoneOtp() {
        return phoneOtp;
    }

    public void setPhoneOtp(String phoneOtp) {
        this.phoneOtp = phoneOtp;
    }

    public LocalDateTime getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(LocalDateTime otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Builder pattern
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String id;
        private String username;
        private String password;
        private String rawPassword;
        private String name;
        private String email;
        private String phone;
        private String role;
        private boolean emailVerified = false;
        private boolean phoneVerified = false;
        private String emailOtp;
        private String phoneOtp;
        private LocalDateTime otpExpiry;
        private LocalDateTime createdAt;

        public UserBuilder id(String id) {
            this.id = id;
            return this;
        }

        public UserBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserBuilder rawPassword(String rawPassword) {
            this.rawPassword = rawPassword;
            return this;
        }

        public UserBuilder name(String name) {
            this.name = name;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UserBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserBuilder emailVerified(boolean emailVerified) {
            this.emailVerified = emailVerified;
            return this;
        }

        public UserBuilder phoneVerified(boolean phoneVerified) {
            this.phoneVerified = phoneVerified;
            return this;
        }

        public UserBuilder emailOtp(String emailOtp) {
            this.emailOtp = emailOtp;
            return this;
        }

        public UserBuilder phoneOtp(String phoneOtp) {
            this.phoneOtp = phoneOtp;
            return this;
        }

        public UserBuilder otpExpiry(LocalDateTime otpExpiry) {
            this.otpExpiry = otpExpiry;
            return this;
        }

        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public User build() {
            return new User(id, username, password, rawPassword, name, email, phone, role, emailVerified, phoneVerified, emailOtp, phoneOtp, otpExpiry, createdAt);
        }
    }
}

