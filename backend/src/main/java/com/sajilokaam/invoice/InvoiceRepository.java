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
    
    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, LENGTH(:prefix) + 1) AS int)) FROM Invoice i WHERE i.invoiceNumber LIKE :prefix%")
    Optional<Integer> findMaxInvoiceNumber(String prefix);
}

