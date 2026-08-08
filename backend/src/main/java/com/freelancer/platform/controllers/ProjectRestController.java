package com.freelancer.platform.controllers;

import com.freelancer.platform.models.Invoice;
import com.freelancer.platform.models.Project;
import com.freelancer.platform.models.User;
import com.freelancer.platform.services.EmailService;
import com.freelancer.platform.services.InvoiceService;
import com.freelancer.platform.services.ProjectService;
import com.freelancer.platform.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class ProjectRestController {

    private final ProjectService projectService;
    private final UserService userService;
    private final InvoiceService invoiceService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    public ProjectRestController(ProjectService projectService, UserService userService,
                                 InvoiceService invoiceService, UserDetailsService userDetailsService,
                                 EmailService emailService) {
        this.projectService = projectService;
        this.userService = userService;
        this.invoiceService = invoiceService;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
    }

    // Submit Homepage Contact Inquiry
    @PostMapping("/api/public/contact")
    public ResponseEntity<?> submitContactInquiry(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String subject = payload.get("subject");
        String message = payload.get("message");

        if (name == null || email == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Name, email, and message are required."));
        }

        emailService.sendContactInquiryEmail(name, email, subject, message);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Thank you, " + name + "! Your inquiry has been dispatched to our team via email."
        ));
    }

    // Submit Project Request
    @PostMapping("/api/public/project-request")
    public ResponseEntity<?> submitProjectRequest(@RequestBody Map<String, String> payload, Principal principal, HttpServletRequest request) {
        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.get("phone");
        String projectType = payload.get("projectType");
        String budgetStr = payload.get("budget");
        String deadline = payload.get("deadline");
        String description = payload.get("description");
        String couponCode = payload.get("couponCode");
        String attachmentName = payload.get("attachmentName");

        if (name == null || email == null || projectType == null || budgetStr == null || deadline == null || description == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing required fields."));
        }

        Double budget = Double.parseDouble(budgetStr);
        String clientUsername;
        String clientRealName;

        // Apply discount coupon if valid
        boolean couponApplied = false;
        if ("FREELANCE20".equalsIgnoreCase(couponCode) || "WELCOME20".equalsIgnoreCase(couponCode)) {
            budget = budget * 0.8; // 20% discount
            couponApplied = true;
        }

        // If client is not logged in, auto-register them
        if (principal == null) {
            clientUsername = email; // Use email as username
            clientRealName = name;

            Optional<User> existingUser = userService.findByUsername(clientUsername);
            if (existingUser.isEmpty()) {
                // Register new client with default password
                User newUser = User.builder()
                        .username(clientUsername)
                        .password("clientpassword") // Default password
                        .name(clientRealName)
                        .email(email)
                        .phone(phone)
                        .role("ROLE_CLIENT")
                        .build();
                userService.registerUser(newUser);
            }

            // Authenticate programmatically
            UserDetails userDetails = userDetailsService.loadUserByUsername(clientUsername);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Bind context to session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        } else {
            clientUsername = principal.getName();
            User user = userService.findByUsername(clientUsername).orElse(null);
            clientRealName = (user != null) ? user.getName() : clientUsername;
        }

        // Create Project Document
        Project newProject = Project.builder()
                .clientId(clientUsername)
                .clientName(clientRealName)
                .title(projectType + " - Proposal")
                .description(description)
                .projectType(projectType)
                .budget(budget)
                .deadline(deadline)
                .status("RECEIVED")
                .progress(10)
                .attachmentName(attachmentName != null ? attachmentName : "Project Specification.pdf")
                .build();
        
        Project savedProject = projectService.createProject(newProject);

        // Generate corresponding invoice
        Invoice invoice = Invoice.builder()
                .projectId(savedProject.getId())
                .projectTitle(savedProject.getTitle())
                .clientId(clientUsername)
                .clientName(clientRealName)
                .amount(budget)
                .dueDate(deadline)
                .status("UNPAID")
                .build();
        invoiceService.createInvoice(invoice);

        // Send Order Confirmation Email to Client
        emailService.sendOrderConfirmationEmail(email, clientRealName, savedProject.getTitle(), budget, projectType);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Project proposal submitted successfully!" + (principal == null ? " An account was created using your email with password 'clientpassword'." : ""),
                "couponApplied", couponApplied,
                "finalBudget", budget,
                "redirect", "/client/dashboard"
        ));
    }

    // CLIENT: Fetch own projects
    @GetMapping("/api/client/projects")
    public ResponseEntity<?> getClientProjects(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("success", false));
        return ResponseEntity.ok(projectService.getProjectsByClient(principal.getName()));
    }

    // CLIENT: Fetch own invoices
    @GetMapping("/api/client/invoices")
    public ResponseEntity<?> getClientInvoices(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("success", false));
        return ResponseEntity.ok(invoiceService.getInvoicesByClient(principal.getName()));
    }

    // ADMIN: Fetch all projects
    @GetMapping("/api/admin/projects")
    public ResponseEntity<?> getAllProjects(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("success", false));
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // ADMIN: Fetch all invoices
    @GetMapping("/api/admin/invoices")
    public ResponseEntity<?> getAllInvoices(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("success", false));
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    // ADMIN: Update Project Timeline Status
    @PostMapping("/api/admin/projects/{id}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable String id, @RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        User user = userService.findByUsername(principal.getName()).orElse(null);
        if (user == null || !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
        }

        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Status field required"));
        }

        try {
            Project project = projectService.updateProjectStatus(id, newStatus);
            return ResponseEntity.ok(Map.of("success", true, "message", "Project status updated successfully!", "project", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // CLIENT: Pay Invoice
    @PostMapping("/api/invoices/{id}/pay")
    public ResponseEntity<?> payInvoice(@PathVariable String id, @RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }

        String paymentMethod = payload.get("paymentMethod");
        if (paymentMethod == null) {
            paymentMethod = "Card (Stripe)";
        }

        try {
            Invoice invoice = invoiceService.payInvoice(id, paymentMethod);
            return ResponseEntity.ok(Map.of("success", true, "message", "Payment processed successfully!", "invoice", invoice));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
