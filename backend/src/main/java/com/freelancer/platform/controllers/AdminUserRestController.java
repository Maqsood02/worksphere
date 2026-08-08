package com.freelancer.platform.controllers;

import com.freelancer.platform.models.User;
import com.freelancer.platform.services.EmailService;
import com.freelancer.platform.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserRestController {

    private final UserService userService;
    private final EmailService emailService;

    public AdminUserRestController(UserService userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = new ArrayList<>();
        try {
            users.addAll(userService.findAllUsers());
        } catch (Exception e) {
            System.err.println("[AdminUserRestController] DB fetch error: " + e.getMessage());
        }

        // Ensure default admin account is included if DB is fresh
        Set<String> existingUsernames = users.stream()
                .map(User::getUsername)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!existingUsernames.contains("worksphere") && !existingUsernames.contains("admin")) {
            users.add(User.builder().username("worksphere").name("Maqsood M D").email("worksphere.ac.in@gmail.com").phone("8792404950").role("ROLE_ADMIN").rawPassword("Workshere@123").emailVerified(true).build());
        }

        List<Map<String, Object>> response = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId() != null ? user.getId() : user.getUsername());
            map.put("username", user.getUsername());
            map.put("name", user.getName() != null ? user.getName() : user.getUsername());
            map.put("email", user.getEmail() != null ? user.getEmail() : user.getUsername() + "@worksphere.ac.in");
            map.put("phone", user.getPhone() != null ? user.getPhone() : "");
            map.put("role", user.getRole() != null ? user.getRole() : "ROLE_CLIENT");
            map.put("rawPassword", user.getRawPassword() != null ? user.getRawPassword() : "");
            map.put("emailVerified", user.isEmailVerified());
            map.put("phoneVerified", user.isPhoneVerified());
            map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "users", response,
            "totalCount", response.size()
        ));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.get("phone");
        String role = payload.get("role");

        if (username == null || password == null || name == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username, password, name, and email are required."));
        }

        try {
            User newUser = User.builder()
                    .username(username)
                    .password(password)
                    .rawPassword(password)
                    .name(name)
                    .email(email)
                    .phone(phone != null ? phone : "")
                    .role(role != null && !role.isBlank() ? role : "ROLE_CLIENT")
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();

            userService.registerUser(newUser);

            // Automatically dispatch account credentials email to user/intern
            emailService.sendInternCredentialsEmail(email, name, username, password, newUser.getRole());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User @" + username + " created & credentials email sent successfully!",
                "user", Map.of(
                    "username", newUser.getUsername(),
                    "name", newUser.getName(),
                    "email", newUser.getEmail(),
                    "role", newUser.getRole(),
                    "rawPassword", password
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error creating user."));
        }
    }

    @PostMapping("/{username}/send-credentials")
    public ResponseEntity<?> sendCredentials(@PathVariable String username, @RequestBody(required = false) Map<String, String> payload) {
        Optional<User> userOpt = userService.findByUsername(username);
        String name = userOpt.map(User::getName).orElse(username);
        String email = userOpt.map(User::getEmail).orElse(username.contains("@") ? username : username + "@worksphere.ac.in");
        String role = userOpt.map(User::getRole).orElse("ROLE_CLIENT");

        String rawPassword;
        if (payload != null && payload.containsKey("password") && payload.get("password") != null && !payload.get("password").isBlank()) {
            rawPassword = payload.get("password");
            userService.updateUserPassword(username, rawPassword);
        } else {
            rawPassword = userOpt.map(User::getRawPassword).orElse(null);
        }

        // If rawPassword is missing from DB, generate a secure default password and update DB
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = username + "Pass@" + (100 + new Random().nextInt(900));
            userService.updateUserPassword(username, rawPassword);
        }

        try {
            emailService.sendInternCredentialsEmailSync(email, name, username, rawPassword, role);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Credentials email sent successfully to " + email + " from worksphere.ac.in@gmail.com!",
                "username", username,
                "email", email,
                "rawPassword", rawPassword
            ));
        } catch (Exception e) {
            System.err.println("[SMTP ERROR] Failed sending to " + email + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "SMTP Delivery Error: " + e.getMessage() + ". Please check Gmail App Password or use 'Open Mail App'.",
                "email", email
            ));
        }
    }

    @PostMapping("/{username}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String username, @RequestBody Map<String, String> payload) {
        String newRole = payload.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Role parameter is required."));
        }

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(newRole);
            userService.save(user);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User @" + username + " role updated to " + newRole + " successfully!",
            "username", username,
            "newRole", newRole
        ));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        if ("admin".equalsIgnoreCase(username)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Primary admin user cannot be deleted."));
        }

        userService.deleteByUsername(username);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User @" + username + " deleted successfully!"
        ));
    }
}
