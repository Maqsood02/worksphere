package com.freelancer.platform.services;

import com.freelancer.platform.models.Appointment;
import com.freelancer.platform.repositories.AppointmentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment bookAppointment(Appointment appointment) {
        appointment.setStatus("CONFIRMED");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByClient(String clientId) {
        return appointmentRepository.findByClientId(clientId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(String id) {
        return appointmentRepository.findById(id);
    }

    public void cancelAppointment(String id) {
        appointmentRepository.findById(id).ifPresent(app -> {
            app.setStatus("CANCELLED");
            appointmentRepository.save(app);
        });
    }

    @PostConstruct
    public void seedAppointments() {
        if (appointmentRepository.count() == 0) {
            Appointment a1 = Appointment.builder()
                    .clientId("client")
                    .clientName("John Doe")
                    .clientEmail("john.doe@company.com")
                    .title("Sprint 1 Planning - E-Commerce App")
                    .date("2026-07-22")
                    .timeSlot("10:00 AM - 11:00 AM")
                    .description("Review wireframes and database connections.")
                    .status("CONFIRMED")
                    .build();

            Appointment a2 = Appointment.builder()
                    .clientId("client")
                    .clientName("John Doe")
                    .clientEmail("john.doe@company.com")
                    .title("Chatbot Review Session")
                    .date("2026-07-24")
                    .timeSlot("02:00 PM - 03:00 PM")
                    .description("Test OpenAI prompt instructions and replies.")
                    .status("CONFIRMED")
                    .build();

            appointmentRepository.save(a1);
            appointmentRepository.save(a2);
            System.out.println("[DB SEED] Default appointments seeded!");
        }
    }
}
