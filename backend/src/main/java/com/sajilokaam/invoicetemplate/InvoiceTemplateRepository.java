package com.sajilokaam.invoicetemplate;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvoiceTemplateRepository extends JpaRepository<InvoiceTemplate, Long> {
    Optional<InvoiceTemplate> findByIsDefaultTrue();
}

