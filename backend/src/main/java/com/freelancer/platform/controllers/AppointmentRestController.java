package com.freelancer.platform.controllers;

import com.freelancer.platform.models.Appointment;
import com.freelancer.platform.models.User;
import com.freelancer.platform.services.AppointmentService;
import com.freelancer.platform.services.EmailService;
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
import java.util.Map;
import java.util.Optional;

@RestController
public class AppointmentRestController {

    private final AppointmentService appointmentService;
    private final UserService userService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    public AppointmentRestController(AppointmentService appointmentService, UserService userService,
                                     UserDetailsService userDetailsService, EmailService emailService) {
        this.appointmentService = appointmentService;
        this.userService = userService;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
    }

    // Book Appointment
    @PostMapping("/api/appointments/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, String> payload, Principal principal, HttpServletRequest request) {
        String title = payload.get("title");
        String date = payload.get("date"); // yyyy-MM-dd
        String timeSlot = payload.get("timeSlot");
        String description = payload.get("description");
        String clientEmail = payload.get("clientEmail");
        String clientName = payload.get("clientName");

        if (title == null || date == null || timeSlot == null || description == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing required appointment fields"));
        }

        String clientId;
        String finalClientName;
        String finalClientEmail;

        if (principal == null) {
            if (clientEmail == null || clientName == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and Name are required for guest booking"));
            }
            clientId = clientEmail;
            finalClientName = clientName;
            finalClientEmail = clientEmail;

            // Auto-register guest if not exists
            Optional<User> existingUser = userService.findByUsername(clientId);
            if (existingUser.isEmpty()) {
                User newUser = User.builder()
                        .username(clientId)
                        .password("clientpassword") // Default password
                        .name(finalClientName)
                        .email(finalClientEmail)
                        .role("ROLE_CLIENT")
                        .emailVerified(true)
                        .build();
                userService.registerUser(newUser);
            }

            // Authenticate programmatically
            UserDetails userDetails = userDetailsService.loadUserByUsername(clientId);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);

            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        } else {
            clientId = principal.getName();
            User user = userService.findByUsername(clientId).orElse(null);
            finalClientName = (user != null) ? user.getName() : clientId;
            finalClientEmail = (user != null) ? user.getEmail() : "";
        }

        Appointment appointment = Appointment.builder()
                .clientId(clientId)
                .clientName(finalClientName)
                .clientEmail(finalClientEmail)
                .title(title)
                .date(date)
                .timeSlot(timeSlot)
                .description(description)
                .build();

        Appointment booked = appointmentService.bookAppointment(appointment);

        // Trigger appointment confirmation email
        if (finalClientEmail != null && !finalClientEmail.isBlank()) {
            emailService.sendAppointmentEmail(finalClientEmail, finalClientName, date, timeSlot, title);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Appointment booked successfully!",
                "appointment", booked,
                "redirect", "/client/dashboard"
        ));
    }

    // CLIENT: Fetch own booked appointments
    @GetMapping("/api/client/appointments")
    public ResponseEntity<?> getClientAppointments(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("success", false));
        return ResponseEntity.ok(appointmentService.getAppointmentsByClient(principal.getName()));
    }

    // ADMIN: Fetch all booked appointments
    @GetMapping("/api/admin/appointments")
    public ResponseEntity<?> getAllAppointments(Principal principal) {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // ADMIN: Cancel / Reschedule
    @PostMapping("/api/appointments/admin/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable String id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        User user = userService.findByUsername(principal.getName()).orElse(null);
        if (user == null || !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
        }

        try {
            appointmentService.cancelAppointment(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Appointment cancelled successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
