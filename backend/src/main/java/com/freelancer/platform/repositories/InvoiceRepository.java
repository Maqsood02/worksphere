package com.freelancer.platform.repositories;

import com.freelancer.platform.models.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByClientId(String clientId);
    List<Invoice> findByProjectId(String projectId);
}
