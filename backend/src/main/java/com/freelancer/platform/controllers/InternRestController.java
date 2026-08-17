package com.freelancer.platform.controllers;

import com.freelancer.platform.models.User;
import com.freelancer.platform.services.EmailService;
import com.freelancer.platform.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class InternRestController {

    private final UserService userService;
    private final EmailService emailService;

    // In-memory data store for intern profiles, tasks, attendance, and certificates
    private final Map<String, Map<String, Object>> internProfiles = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> tasksList = new ArrayList<>();
    private final List<Map<String, Object>> attendanceLogs = new ArrayList<>();
    private final List<Map<String, Object>> learningModules = new ArrayList<>();
    private final List<Map<String, Object>> certificatesIssued = new ArrayList<>();

    public InternRestController(UserService userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
        initializeDefaultData();
    }

    private synchronized void initializeDefaultData() {
        if (!internProfiles.isEmpty()) return;

        // Seed Profile for "intern"
        Map<String, Object> internData = new HashMap<>();
        internData.put("username", "intern");
        internData.put("name", "Alex Rivera");
        internData.put("email", "alex.intern@worksphere.ac.in");
        internData.put("track", "Full-Stack Software Engineering");
        internData.put("mentorName", "Unassigned Mentor");
        internData.put("mentorEmail", "s.jenkins@worksphere.ac.in");
        internData.put("startDate", "2026-06-01");
        internData.put("endDate", "2026-08-31");
        internData.put("stipendType", "UNPAID"); // PAID or UNPAID
        internData.put("stipendAmount", "Unpaid (Academic Credit)");
        internData.put("performanceRating", "New Intern");
        internData.put("certificateStatus", "NOT_ISSUED"); // NOT_ISSUED, PENDING, ISSUED
        internProfiles.put("intern", internData);

        // Seed Profile for "maqsood"
        Map<String, Object> maqsoodData = new HashMap<>(internData);
        maqsoodData.put("username", "maqsood");
        maqsoodData.put("name", "Maqsood MD");
        maqsoodData.put("email", "maqsoodmd.ac.in@gmail.com");
        internProfiles.put("maqsood", maqsoodData);

        // Seed Profile for "chinmaykv"
        Map<String, Object> chinmayData = new HashMap<>(internData);
        chinmayData.put("username", "chinmaykv");
        chinmayData.put("name", "Chinmay K V");
        chinmayData.put("email", "chinmaykv555@gmail.com");
        internProfiles.put("chinmaykv", chinmayData);
    }

    private synchronized Map<String, Object> getOrCreateProfile(String username) {
        String key = (username != null && !username.isBlank()) ? username.toLowerCase() : "intern";
        if (!internProfiles.containsKey(key)) {
            Optional<User> userOpt = userService.findByUsername(username);
            String name = userOpt.map(User::getName).orElse("Intern " + username);
            String email = userOpt.map(User::getEmail).orElse(username + "@worksphere.ac.in");

            Map<String, Object> newProfile = new HashMap<>();
            newProfile.put("username", username);
            newProfile.put("name", name);
            newProfile.put("email", email);
            newProfile.put("track", "Full-Stack Software Engineering");
            newProfile.put("mentorName", "Unassigned Mentor");
            newProfile.put("mentorEmail", "s.jenkins@worksphere.ac.in");
            newProfile.put("startDate", LocalDate.now().toString());
            newProfile.put("endDate", LocalDate.now().plusMonths(3).toString());
            newProfile.put("stipendType", "UNPAID");
            newProfile.put("stipendCurrency", "INR");
            newProfile.put("stipendAmount", "Unpaid (Academic Credit)");
            newProfile.put("performanceRating", "New Intern");
            newProfile.put("certificateStatus", "NOT_ISSUED");
            internProfiles.put(key, newProfile);
        }
        return internProfiles.get(key);
    }

    // -------------------------------------------------------------
    // INTERN ENDPOINTS (/api/intern/...)
    // -------------------------------------------------------------

    @GetMapping("/api/intern/overview")
    public ResponseEntity<?> getOverview(Principal principal) {
        String username = principal != null ? principal.getName() : "intern";
        Map<String, Object> profile = getOrCreateProfile(username);

        List<Map<String, Object>> myAttendance = new ArrayList<>();
        for (Map<String, Object> a : attendanceLogs) {
            if (username.equalsIgnoreCase((String) a.get("username"))) {
                myAttendance.add(a);
            }
        }

        long completedCount = tasksList.stream().filter(t -> 
            (username.equalsIgnoreCase((String) t.get("assignedTo")) || "ALL".equalsIgnoreCase((String) t.get("assignedTo"))) &&
            ("COMPLETED".equals(t.get("status")) || "APPROVED".equals(t.get("status")))
        ).count();
        int totalLoggedHours = myAttendance.stream().mapToInt(a -> (int) a.get("hours")).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("tasksCompleted", completedCount);
        stats.put("tasksTotal", tasksList.size());
        stats.put("hoursLogged", totalLoggedHours);
        stats.put("attendanceRate", myAttendance.isEmpty() ? "0%" : "100%");
        
        String stipendType = (String) profile.getOrDefault("stipendType", "UNPAID");
        if ("UNPAID".equalsIgnoreCase(stipendType)) {
            stats.put("stipendStatus", "Unpaid (Academic Credit)");
        } else {
            stats.put("stipendStatus", "Paid (" + profile.getOrDefault("stipendAmount", "Pending Admin Setup") + ")");
        }

        // Find Issued Certificate if any for this specific intern
        Map<String, Object> certificate = certificatesIssued.stream()
                .filter(c -> username.equalsIgnoreCase((String) c.get("username")))
                .findFirst()
                .orElse(null);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "profile", profile,
            "stats", stats,
            "tasks", tasksList,
            "attendanceLogs", myAttendance,
            "learningModules", learningModules,
            "certificate", certificate != null ? certificate : Map.of("issued", false)
        ));
    }

    @PostMapping("/api/intern/tasks/{taskId}/claim")
    public synchronized ResponseEntity<?> claimTask(@PathVariable String taskId, Principal principal) {
        String username = principal != null ? principal.getName() : "intern";
        for (Map<String, Object> task : tasksList) {
            if (taskId.equals(task.get("id")) || taskId.equals(task.get("title"))) {
                task.put("assignedTo", username);
                task.put("status", "IN_PROGRESS");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Task claimed successfully! You are now assigned to @" + username + " and can start working.",
                    "task", task
                ));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Task ID not found."));
    }

    @PostMapping("/api/intern/tasks/{taskId}/submit")
    public synchronized ResponseEntity<?> submitTask(@PathVariable String taskId, @RequestBody Map<String, String> payload) {
        String url = payload.get("submissionUrl");
        String notes = payload.get("notes");

        for (Map<String, Object> task : tasksList) {
            if (taskId.equals(task.get("id")) || taskId.equals(task.get("title"))) {
                task.put("status", "SUBMITTED");
                task.put("submissionUrl", url != null ? url : "");
                task.put("submissionNotes", notes != null ? notes : "");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Task deliverable submitted successfully! Awaiting Admin review & approval.",
                    "task", task
                ));
            }
        }

        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Task ID not found."));
    }

    @PostMapping("/api/intern/attendance/log")
    public synchronized ResponseEntity<?> logAttendance(@RequestBody Map<String, Object> payload, Principal principal) {
        String username = principal != null ? principal.getName() : "intern";
        Object hoursObj = payload.get("hours");
        String summary = (String) payload.get("summary");

        int hours = 8;
        if (hoursObj instanceof Number) {
            hours = ((Number) hoursObj).intValue();
        } else if (hoursObj instanceof String) {
            try {
                hours = Integer.parseInt((String) hoursObj);
            } catch (Exception ignored) {}
        }

        Map<String, Object> newLog = new HashMap<>();
        newLog.put("id", "ATT-" + (attendanceLogs.size() + 101));
        newLog.put("username", username);
        newLog.put("date", LocalDate.now().toString());
        newLog.put("hours", hours);
        newLog.put("summary", summary != null && !summary.isBlank() ? summary : "Completed sprint backlog tasks.");
        newLog.put("status", "SUBMITTED");

        attendanceLogs.add(0, newLog);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Daily standup log saved successfully!",
            "log", newLog
        ));
    }

    @PostMapping("/api/intern/certificate/request")
    public synchronized ResponseEntity<?> requestCertificate(Principal principal) {
        String username = principal != null ? principal.getName() : "intern";
        Map<String, Object> profile = getOrCreateProfile(username);
        profile.put("certificateStatus", "PENDING_APPROVAL");

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Certificate request sent to Admin & Mentor Dr. Sarah Jenkins."
        ));
    }

    // -------------------------------------------------------------
    // ADMIN MANAGEMENT ENDPOINTS (/api/admin/interns/...)
    // -------------------------------------------------------------

    @GetMapping("/api/admin/interns")
    public ResponseEntity<?> getAdminInterns() {
        try {
            List<User> allUsers = userService.findAllUsers();
            for (User u : allUsers) {
                if (u.getRole() != null && u.getRole().toUpperCase().contains("INTERN")) {
                    Map<String, Object> prof = getOrCreateProfile(u.getUsername());
                    if (u.getName() != null) prof.put("name", u.getName());
                    if (u.getEmail() != null) prof.put("email", u.getEmail());
                    if (u.getPhone() != null) prof.put("phone", u.getPhone());
                    if (u.getRawPassword() != null) prof.put("rawPassword", u.getRawPassword());
                }
            }
        } catch (Exception ignored) {}

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> p : internProfiles.values()) {
            String uname = (String) p.get("username");
            long totalTasks = tasksList.stream().filter(t -> uname.equalsIgnoreCase((String) t.get("assignedTo")) || "intern".equalsIgnoreCase((String) t.get("assignedTo"))).count();
            long completedTasks = tasksList.stream().filter(t -> (uname.equalsIgnoreCase((String) t.get("assignedTo")) || "intern".equalsIgnoreCase((String) t.get("assignedTo"))) && ("COMPLETED".equals(t.get("status")) || "SUBMITTED".equals(t.get("status")))).count();

            Map<String, Object> copy = new HashMap<>(p);
            Optional<User> uOpt = userService.findByUsername(uname);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                if (u.getPhone() != null && !u.getPhone().isBlank()) copy.put("phone", u.getPhone());
                if (u.getRawPassword() != null) copy.put("rawPassword", u.getRawPassword());
            }
            copy.put("tasksTotal", totalTasks);
            copy.put("tasksCompleted", completedTasks);
            result.add(copy);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "interns", result,
            "allTasks", tasksList
        ));
    }

    @PostMapping("/api/admin/interns/{username}/update")
    public synchronized ResponseEntity<?> updateInternProfile(@PathVariable String username, @RequestBody Map<String, Object> payload) {
        Map<String, Object> profile = getOrCreateProfile(username);

        if (payload.containsKey("stipendType")) {
            String sType = String.valueOf(payload.get("stipendType"));
            profile.put("stipendType", sType);
            if ("UNPAID".equalsIgnoreCase(sType)) {
                profile.put("stipendAmount", "Unpaid (Academic Credit)");
            }
        }
        if (payload.containsKey("stipendAmount")) {
            String currentType = String.valueOf(profile.getOrDefault("stipendType", "UNPAID"));
            if ("UNPAID".equalsIgnoreCase(currentType)) {
                profile.put("stipendAmount", "Unpaid (Academic Credit)");
            } else {
                profile.put("stipendAmount", payload.get("stipendAmount"));
            }
        }
        if (payload.containsKey("stipendCurrency")) {
            profile.put("stipendCurrency", payload.get("stipendCurrency"));
        }
        if (payload.containsKey("mentorName")) {
            profile.put("mentorName", payload.get("mentorName"));
        }
        if (payload.containsKey("mentorEmail")) {
            profile.put("mentorEmail", payload.get("mentorEmail"));
        }
        if (payload.containsKey("track")) {
            profile.put("track", payload.get("track"));
        }
        if (payload.containsKey("startDate")) {
            profile.put("startDate", payload.get("startDate"));
        }
        if (payload.containsKey("endDate")) {
            profile.put("endDate", payload.get("endDate"));
        }
        if (payload.containsKey("performanceRating")) {
            profile.put("performanceRating", payload.get("performanceRating"));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Intern profile and stipend settings updated successfully!",
            "profile", profile
        ));
    }

    @PostMapping("/api/admin/interns/{username}/tasks")
    public synchronized ResponseEntity<?> assignTaskToIntern(@PathVariable String username, @RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String description = payload.get("description");
        String deadline = payload.get("deadline");
        String priority = payload.get("priority");

        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Task title is required."));
        }

        Map<String, Object> newTask = new HashMap<>();
        newTask.put("id", "TSK-" + (tasksList.size() + 105));
        newTask.put("assignedTo", username);
        newTask.put("title", title);
        newTask.put("description", description != null ? description : "");
        newTask.put("deadline", deadline != null && !deadline.isBlank() ? deadline : LocalDate.now().plusDays(7).toString());
        newTask.put("priority", priority != null ? priority : "HIGH");
        newTask.put("status", "IN_PROGRESS");
        newTask.put("submissionUrl", "");
        newTask.put("submissionNotes", "");

        tasksList.add(newTask);

        // Dispatch Email Notification to Intern's Registered Email ID(s)
        boolean emailSent = false;
        String noticeMsg = "";

        if ("ALL".equalsIgnoreCase(username)) {
            List<User> allUsers = userService.findAllUsers();
            int sentCount = 0;
            for (User u : allUsers) {
                if (u.getRole() != null && u.getRole().toUpperCase().contains("INTERN")) {
                    String internName = u.getName() != null ? u.getName() : u.getUsername();
                    String email = u.getEmail();
                    if (email == null || !email.contains("@") || email.endsWith("@worksphere.ac.in")) {
                        String lower = u.getUsername().toLowerCase();
                        if (lower.contains("chinmay")) email = "chinmaykv555@gmail.com";
                        else email = "maqsoodmd.ac.in@gmail.com";
                    }
                    try {
                        System.out.println("[SMTP DISPATCH] Task assigned email to registered intern: " + email + " (@" + u.getUsername() + ")");
                        emailService.sendTaskAssignedEmail(email, internName, u.getUsername(), title, description, deadline, priority);
                        sentCount++;
                    } catch (Exception e) {
                        System.err.println("[SMTP ERROR] Task email trigger failed for @" + u.getUsername() + ": " + e.getMessage());
                    }
                }
            }
            // Fallback default emails if db search returned 0
            if (sentCount == 0) {
                try {
                    emailService.sendTaskAssignedEmail("maqsoodmd.ac.in@gmail.com", "Maqsood MD", "maqsood", title, description, deadline, priority);
                    emailService.sendTaskAssignedEmail("chinmaykv555@gmail.com", "Chinmay K V", "Chinmaykv", title, description, deadline, priority);
                    sentCount = 2;
                } catch (Exception ignored) {}
            }
            emailSent = sentCount > 0;
            noticeMsg = "New task assigned to ALL Interns & email notifications dispatched to " + sentCount + " registered intern email(s)!";
        } else {
            Optional<User> userOpt = userService.findByUsername(username);
            Map<String, Object> profile = getOrCreateProfile(username);

            String internName = userOpt.map(User::getName).orElse((String) profile.getOrDefault("name", username));
            String email = userOpt.map(User::getEmail).filter(e -> e != null && e.contains("@") && !e.endsWith("@worksphere.ac.in")).orElse((String) profile.get("email"));

            if (email == null || !email.contains("@") || email.endsWith("@worksphere.ac.in")) {
                String lower = username.toLowerCase();
                if (lower.contains("chinmay")) email = "chinmaykv555@gmail.com";
                else if (lower.contains("worksphere") || lower.contains("admin")) email = "worksphere.ac.in@gmail.com";
                else email = "maqsoodmd.ac.in@gmail.com";
            }

            try {
                System.out.println("[SMTP DISPATCH] Task assigned email notification to: " + email + " for @" + username);
                emailService.sendTaskAssignedEmail(email, internName, username, title, description, deadline, priority);
                emailSent = true;
            } catch (Exception e) {
                System.err.println("[SMTP ERROR] Task email trigger failed: " + e.getMessage());
            }
            noticeMsg = "New task assigned to @" + username + " & notification email dispatched to registered email " + email + "!";
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "emailSent", emailSent,
            "message", noticeMsg,
            "task", newTask
        ));
    }

    @PostMapping("/api/admin/interns/{username}/certificate/generate")
    public synchronized ResponseEntity<?> generateCertificate(@PathVariable String username, @RequestBody(required = false) Map<String, String> payload) {
        Map<String, Object> profile = getOrCreateProfile(username);
        profile.put("certificateStatus", "ISSUED");

        String certId = "WS-CERT-2026-" + (certificatesIssued.size() + 884);
        String issueDate = LocalDate.now().toString();
        String name = (String) profile.get("name");
        String track = (String) profile.get("track");

        Map<String, Object> cert = new HashMap<>();
        cert.put("issued", true);
        cert.put("certificateId", certId);
        cert.put("username", username);
        cert.put("name", name);
        cert.put("track", track);
        cert.put("issueDate", issueDate);
        cert.put("grade", payload != null && payload.containsKey("grade") ? payload.get("grade") : "DISTINCTION");
        cert.put("issuerName", "WorkSphere Certification Board");
        cert.put("signature", "Dr. Sarah Jenkins & WorkSphere Program Lead");
        cert.put("verificationCode", "VERIFIED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        certificatesIssued.removeIf(c -> username.equalsIgnoreCase((String) c.get("username")));
        certificatesIssued.add(cert);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Official Internship Certificate generated and issued to " + name + "!",
            "certificate", cert
        ));
    }

    @PostMapping("/api/admin/interns/{username}/certificate/revoke")
    public synchronized ResponseEntity<?> revokeCertificate(@PathVariable String username) {
        Map<String, Object> profile = getOrCreateProfile(username);
        profile.put("certificateStatus", "NOT_ISSUED");

        certificatesIssued.removeIf(c -> username.equalsIgnoreCase((String) c.get("username")));

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Internship Certificate for " + profile.get("name") + " revoked successfully."
        ));
    }

    @PostMapping("/api/admin/interns/{username}/send-credentials")
    public synchronized ResponseEntity<?> sendInternCredentials(@PathVariable String username, @RequestBody(required = false) Map<String, String> payload) {
        Map<String, Object> profile = getOrCreateProfile(username);
        Optional<User> userOpt = userService.findByUsername(username);

        String name = (payload != null && payload.get("name") != null && !payload.get("name").isBlank()) 
            ? payload.get("name") : userOpt.map(User::getName).orElse((String) profile.getOrDefault("name", username));
        String role = (payload != null && payload.get("role") != null && !payload.get("role").isBlank()) 
            ? payload.get("role") : userOpt.map(User::getRole).orElse("ROLE_INTERN");

        String email = null;
        if (payload != null && payload.get("email") != null && payload.get("email").contains("@")) {
            email = payload.get("email");
        } else {
            email = userOpt.map(User::getEmail).filter(e -> e != null && !e.isBlank() && e.contains("@") && !e.endsWith("@worksphere.ac.in")).orElse((String) profile.get("email"));
        }

        if (email == null || email.isBlank() || !email.contains("@") || email.endsWith("@worksphere.ac.in")) {
            String lower = username.toLowerCase();
            if (lower.contains("chinmay")) email = "chinmaykv555@gmail.com";
            else if (lower.contains("worksphere") || lower.contains("admin")) email = "worksphere.ac.in@gmail.com";
            else email = "maqsoodmd.ac.in@gmail.com";
        }

        String rawPassword;
        if (payload != null && payload.containsKey("password") && payload.get("password") != null && !payload.get("password").isBlank()) {
            rawPassword = payload.get("password");
            userService.updateUserPassword(username, rawPassword);
        } else {
            rawPassword = userOpt.map(User::getRawPassword).orElse("123456");
        }

        boolean emailSent = false;
        String emailNotice = "";
        try {
            System.out.println("[SMTP START] Dispatching intern credentials email to: " + email);
            emailService.sendInternCredentialsEmailSync(email, name, username, rawPassword, role);
            emailSent = true;
            emailNotice = "HTML Credentials Email sent successfully to " + email + " from worksphere.ac.in@gmail.com!";
            System.out.println("[SMTP SUCCESS] Credentials email delivered to: " + email);
        } catch (Exception e) {
            System.err.println("[SMTP ERROR] Failed sending to " + email + ": " + e.getMessage());
            emailNotice = "Credentials saved! (SMTP Note: " + e.getMessage() + ")";
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "emailSent", emailSent,
            "message", emailNotice,
            "email", email,
            "username", username,
            "rawPassword", rawPassword
        ));
    }

    @PostMapping("/api/admin/interns/tasks/{taskId}/status")
    public synchronized ResponseEntity<?> updateTaskStatus(@PathVariable String taskId, @RequestBody Map<String, String> payload) {
        String status = payload != null ? payload.get("status") : "COMPLETED";

        for (Map<String, Object> t : tasksList) {
            if (taskId.equalsIgnoreCase(String.valueOf(t.get("id")))) {
                t.put("status", status != null ? status : "COMPLETED");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Task " + taskId + " status updated to " + status + "!",
                    "task", t
                ));
            }
        }

        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Task not found."));
    }

    @DeleteMapping("/api/admin/interns/tasks/{taskId}")
    public synchronized ResponseEntity<?> deleteInternTask(@PathVariable String taskId) {
        boolean removed = tasksList.removeIf(t -> taskId.equalsIgnoreCase(String.valueOf(t.get("id"))));
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Assigned deliverable task " + taskId + " deleted successfully!"
        ));
    }

    @PostMapping("/api/admin/interns/tasks/{taskId}/delete")
    public synchronized ResponseEntity<?> deleteInternTaskPost(@PathVariable String taskId) {
        return deleteInternTask(taskId);
    }
}
