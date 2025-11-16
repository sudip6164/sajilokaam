package com.sajilokaam.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<Invoice> findByFreelancerIdOrderByCreatedAtDesc(Long freelancerId);
    List<Invoice> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Invoice> findByStatus(String status);
    
    @Query("SELECT i FROM Invoice i WHERE i.invoiceNumber LIKE :prefix% ORDER BY i.invoiceNumber DESC")
    List<Invoice> findByInvoiceNumberPrefix(String prefix);
}

