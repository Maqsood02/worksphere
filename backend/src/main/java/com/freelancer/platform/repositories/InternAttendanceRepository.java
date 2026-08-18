package com.freelancer.platform.repositories;

import com.freelancer.platform.models.InternAttendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternAttendanceRepository extends MongoRepository<InternAttendance, String> {
    List<InternAttendance> findByUsernameIgnoreCase(String username);
    Optional<InternAttendance> findByLogId(String logId);
    void deleteByLogId(String logId);
    void deleteByUsernameIgnoreCase(String username);
}
