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
        // Initial state: Zero appointments (Appointments start empty until booked)
    }
}
