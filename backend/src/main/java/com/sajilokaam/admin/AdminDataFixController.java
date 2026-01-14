package com.sajilokaam.admin;

import com.sajilokaam.auth.RequiresAdmin;
import com.sajilokaam.invoice.Invoice;
import com.sajilokaam.invoice.InvoiceRepository;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/data-fix")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminDataFixController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @PostMapping("/create-missing-invoices")
    public ResponseEntity<Map<String, Object>> createMissingInvoices() {
        // Find all PENDING_PAYMENT projects without invoices
        List<Project> pendingProjects = projectRepository.findAll().stream()
                .filter(p -> "PENDING_PAYMENT".equals(p.getStatus()))
                .toList();

        int created = 0;
        int skipped = 0;
        
        for (Project project : pendingProjects) {
            // Check if invoice already exists for this project
            List<Invoice> existingInvoices = invoiceRepository.findByProject_IdOrderByCreatedAtDesc(project.getId());
            
            if (existingInvoices.isEmpty()) {
                // Create invoice for this project
                Invoice invoice = new Invoice();
                invoice.setProject(project);
                invoice.setClient(project.getClient());
                invoice.setFreelancer(project.getFreelancer());
                invoice.setStatus("PENDING");
                invoice.setNotes("Payment for project: " + project.getTitle() + " (Auto-generated)");
                invoice.setSubtotal(project.getBudget());
                invoice.setTotalAmount(project.getBudget());
                invoice.setIssueDate(LocalDate.now());
                invoice.setDueDate(LocalDate.now().plusDays(7));
                invoice.setInvoiceNumber("INV-FIX-" + System.currentTimeMillis() + "-" + project.getId());
                
                invoiceRepository.save(invoice);
                created++;
            } else {
                skipped++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Invoice creation completed");
        result.put("projectsChecked", pendingProjects.size());
        result.put("invoicesCreated", created);
        result.put("projectsSkipped", skipped);
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/link-orphaned-invoices")
    public ResponseEntity<Map<String, Object>> linkOrphanedInvoices() {
        // Find invoices without projects
        List<Invoice> orphanedInvoices = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getProject() == null && "PENDING".equals(inv.getStatus()))
                .toList();

        int linked = 0;
        int failed = 0;
        
        for (Invoice invoice : orphanedInvoices) {
            // Try to find a matching project based on client, freelancer, and budget
            List<Project> matchingProjects = projectRepository.findAll().stream()
                    .filter(p -> "PENDING_PAYMENT".equals(p.getStatus()))
                    .filter(p -> p.getClient() != null && p.getClient().getId().equals(invoice.getClient().getId()))
                    .filter(p -> p.getFreelancer() != null && p.getFreelancer().getId().equals(invoice.getFreelancer().getId()))
                    .filter(p -> p.getBudget().compareTo(invoice.getTotalAmount()) == 0)
                    .toList();
            
            if (!matchingProjects.isEmpty()) {
                // Link to the first matching project
                Project project = matchingProjects.get(0);
                invoice.setProject(project);
                invoiceRepository.save(invoice);
                linked++;
            } else {
                failed++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Invoice linking completed");
        result.put("orphanedInvoicesFound", orphanedInvoices.size());
        result.put("invoicesLinked", linked);
        result.put("invoicesFailed", failed);
        
        return ResponseEntity.ok(result);
    }
}
