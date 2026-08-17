package com.freelancer.platform.repositories;

import com.freelancer.platform.models.InternTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternTaskRepository extends MongoRepository<InternTask, String> {
    List<InternTask> findByAssignedToIgnoreCaseOrAssignedToIgnoreCase(String assignedTo, String allKeyword);
    Optional<InternTask> findByTaskId(String taskId);
    void deleteByTaskId(String taskId);
}
