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
        if (invoiceRepository.count() == 0) {
            Invoice i1 = Invoice.builder()
                    .projectId("placeholder-1")
                    .projectTitle("E-Commerce Web Application")
                    .clientId("client")
                    .clientName("John Doe")
                    .amount(1750.0)
                    .dueDate("2026-07-30")
                    .status("UNPAID")
                    .build();

            Invoice i2 = Invoice.builder()
                    .projectId("placeholder-3")
                    .projectTitle("Mobile Booking Utility Android App")
                    .clientId("client")
                    .clientName("John Doe")
                    .amount(4200.0)
                    .dueDate("2026-06-15")
                    .status("PAID")
                    .paymentMethod("Stripe")
                    .build();

            invoiceRepository.save(i1);
            invoiceRepository.save(i2);
            System.out.println("[DB SEED] Default Invoices seeded!");
        }
    }
}
