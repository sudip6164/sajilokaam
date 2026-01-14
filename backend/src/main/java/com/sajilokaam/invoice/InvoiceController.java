package com.sajilokaam.invoice;

import com.sajilokaam.auth.JwtService;
import com.sajilokaam.invoicepdf.InvoicePdfService;
import com.sajilokaam.project.Project;
import com.sajilokaam.project.ProjectRepository;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final InvoicePdfService invoicePdfService;

    public InvoiceController(InvoiceRepository invoiceRepository,
                            InvoiceItemRepository invoiceItemRepository,
                            ProjectRepository projectRepository,
                            UserRepository userRepository,
                            JwtService jwtService,
                            InvoicePdfService invoicePdfService) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.invoicePdfService = invoicePdfService;
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long freelancerId,
            @RequestParam(required = false) String status,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();

        // Get invoices based on filters
        List<Invoice> invoices;
        
        try {
            if (projectId != null) {
                // Get by project and filter by user access
                invoices = invoiceRepository.findByProject_IdOrderByCreatedAtDesc(projectId).stream()
                        .filter(inv -> {
                            // User must be either client or freelancer
                            boolean isClient = inv.getClient() != null && inv.getClient().getId().equals(user.getId());
                            boolean isFreelancer = inv.getFreelancer() != null && inv.getFreelancer().getId().equals(user.getId());
                            return isClient || isFreelancer;
                        })
                        .toList();
            } else if (clientId != null && clientId.equals(user.getId())) {
                invoices = invoiceRepository.findByClient_IdOrderByCreatedAtDesc(user.getId());
            } else if (freelancerId != null && freelancerId.equals(user.getId())) {
                invoices = invoiceRepository.findByFreelancer_IdOrderByCreatedAtDesc(user.getId());
            } else {
                // Return all invoices where user is either client or freelancer
                List<Invoice> clientInvoices = invoiceRepository.findByClient_IdOrderByCreatedAtDesc(user.getId());
                List<Invoice> freelancerInvoices = invoiceRepository.findByFreelancer_IdOrderByCreatedAtDesc(user.getId());
                invoices = new ArrayList<>(clientInvoices);
                final List<Invoice> existingInvoices = new ArrayList<>(clientInvoices);
                invoices.addAll(freelancerInvoices.stream()
                        .filter(inv -> !existingInvoices.contains(inv))
                        .toList());
            }
            
            // Apply status filter if provided
            if (status != null && !status.isEmpty()) {
                invoices = invoices.stream()
                        .filter(inv -> status.equalsIgnoreCase(inv.getStatus()))
                        .toList();
            }
            
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            System.err.println("Error fetching invoices: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(
            @RequestBody InvoiceCreateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User freelancer = userOpt.get();

        // Verify client exists
        Optional<User> clientOpt = userRepository.findById(request.getClientId());
        if (clientOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User client = clientOpt.get();

        // Verify project if provided
        Project project = null;
        if (request.getProjectId() != null) {
            Optional<Project> projectOpt = projectRepository.findById(request.getProjectId());
            if (projectOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            project = projectOpt.get();
        }

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setProject(project);
        invoice.setClient(client);
        invoice.setFreelancer(freelancer);
        invoice.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        invoice.setIssueDate(request.getIssueDate() != null ? request.getIssueDate() : LocalDate.now());
        invoice.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(30));
        invoice.setCurrency(request.getCurrency() != null ? request.getCurrency() : "NPR");
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());

        // Calculate totals from items
        BigDecimal subtotal = BigDecimal.ZERO;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (InvoiceItemCreateRequest itemReq : request.getItems()) {
                BigDecimal itemAmount = itemReq.getUnitPrice().multiply(itemReq.getQuantity());
                subtotal = subtotal.add(itemAmount);
            }
        }
        invoice.setSubtotal(subtotal);

        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        invoice.setTaxRate(taxRate);
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100));
        invoice.setTaxAmount(taxAmount);

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        invoice.setDiscount(discount);

        BigDecimal total = subtotal.add(taxAmount).subtract(discount);
        invoice.setTotalAmount(total);

        Invoice created = invoiceRepository.save(invoice);

        // Create invoice items
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (InvoiceItemCreateRequest itemReq : request.getItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(created);
                item.setDescription(itemReq.getDescription());
                item.setQuantity(itemReq.getQuantity());
                item.setUnitPrice(itemReq.getUnitPrice());
                item.setAmount(itemReq.getUnitPrice().multiply(itemReq.getQuantity()));
                item.setItemType(itemReq.getItemType() != null ? itemReq.getItemType() : "SERVICE");
                invoiceItemRepository.save(item);
            }
        }

        URI location = URI.create("/api/invoices/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceUpdateRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Optional<String> emailOpt = jwtService.extractSubject(token);
        if (emailOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<User> userOpt = userRepository.findByEmail(emailOpt.get());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Invoice invoice = invoiceOpt.get();
        // Verify user is the freelancer who created the invoice
        if (!invoice.getFreelancer().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (request.getStatus() != null) {
            invoice.setStatus(request.getStatus());
            if ("SENT".equals(request.getStatus()) && invoice.getSentAt() == null) {
                invoice.setSentAt(java.time.Instant.now());
            }
            if ("PAID".equals(request.getStatus()) && invoice.getPaidAt() == null) {
                invoice.setPaidAt(java.time.Instant.now());
            }
        }
        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }
        if (request.getNotes() != null) {
            invoice.setNotes(request.getNotes());
        }
        if (request.getTerms() != null) {
            invoice.setTerms(request.getTerms());
        }

        Invoice updated = invoiceRepository.save(invoice);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> generatePdf(@PathVariable Long id) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(id);
        if (invoiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Invoice invoice = invoiceOpt.get();
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        ByteArrayResource resource = new ByteArrayResource(pdfBytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    private String generateInvoiceNumber() {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        List<Invoice> existing = invoiceRepository.findByInvoiceNumberPrefix(prefix + "%");
        int nextNumber = 1;
        if (!existing.isEmpty()) {
            // Extract number from last invoice and increment
            String lastNumber = existing.get(0).getInvoiceNumber();
            try {
                String numberPart = lastNumber.substring(prefix.length() + 1);
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (Exception e) {
                // If parsing fails, start from 1
            }
        }
        return prefix + "-" + String.format("%04d", nextNumber);
    }

    public static class InvoiceCreateRequest {
        private Long projectId;
        private Long clientId;
        private LocalDate issueDate;
        private LocalDate dueDate;
        private BigDecimal taxRate;
        private BigDecimal discount;
        private String currency;
        private String notes;
        private String terms;
        private String status;
        private List<InvoiceItemCreateRequest> items;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        public LocalDate getIssueDate() { return issueDate; }
        public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public BigDecimal getTaxRate() { return taxRate; }
        public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
        public BigDecimal getDiscount() { return discount; }
        public void setDiscount(BigDecimal discount) { this.discount = discount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getTerms() { return terms; }
        public void setTerms(String terms) { this.terms = terms; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public List<InvoiceItemCreateRequest> getItems() { return items; }
        public void setItems(List<InvoiceItemCreateRequest> items) { this.items = items; }
    }

    public static class InvoiceItemCreateRequest {
        private String description;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private String itemType;
        private Long taskId;
        private Long timeLogId;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }
        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public Long getTimeLogId() { return timeLogId; }
        public void setTimeLogId(Long timeLogId) { this.timeLogId = timeLogId; }
    }

    public static class InvoiceUpdateRequest {
        private String status;
        private LocalDate dueDate;
        private String notes;
        private String terms;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getTerms() { return terms; }
        public void setTerms(String terms) { this.terms = terms; }
    }
}

