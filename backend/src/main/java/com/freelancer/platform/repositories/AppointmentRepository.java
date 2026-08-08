package com.freelancer.platform.repositories;

import com.freelancer.platform.models.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByClientId(String clientId);
    List<Appointment> findByDate(String date);
}
