package com.freelancer.platform.services;

import com.freelancer.platform.models.Invoice;
import com.freelancer.platform.repositories.InvoiceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public Invoice createInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getInvoicesByClient(String clientId) {
        return invoiceRepository.findByClientId(clientId);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getInvoiceById(String id) {
        return invoiceRepository.findById(id);
    }

    public Invoice payInvoice(String id, String paymentMethod) {
        Optional<Invoice> opt = invoiceRepository.findById(id);
        if (opt.isPresent()) {
            Invoice invoice = opt.get();
            invoice.setStatus("PAID");
            invoice.setPaymentMethod(paymentMethod);
            return invoiceRepository.save(invoice);
        }
        throw new IllegalArgumentException("Invoice not found: " + id);
    }

    @PostConstruct
    public void seedInvoices() {
        // Initial state: Zero revenue (Invoices start empty until created)
    }
}
