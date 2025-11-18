package com.sajilokaam.invoicepdf;

import com.sajilokaam.invoice.Invoice;
import com.sajilokaam.invoice.InvoiceItem;
import com.sajilokaam.invoice.InvoiceItemRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InvoicePdfService {
    private final InvoiceItemRepository invoiceItemRepository;

    public InvoicePdfService(InvoiceItemRepository invoiceItemRepository) {
        this.invoiceItemRepository = invoiceItemRepository;
    }

    public byte[] generateInvoicePdf(Invoice invoice) throws RuntimeException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = null;
            try {
                contentStream = new PDPageContentStream(document, page);
                float margin = 50;
                float yPosition = 750;
                float currentY = yPosition;

                // Title
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 24);
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText("INVOICE");
                contentStream.endText();
                currentY -= 30;

                // Invoice Number and Date
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText("Invoice #: " + invoice.getInvoiceNumber());
                contentStream.endText();
                
                contentStream.beginText();
                contentStream.newLineAtOffset(400, currentY);
                contentStream.showText("Date: " + invoice.getIssueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
                contentStream.endText();
                currentY -= 20;

                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText("Status: " + invoice.getStatus());
                contentStream.endText();
                
                contentStream.beginText();
                contentStream.newLineAtOffset(400, currentY);
                contentStream.showText("Due Date: " + invoice.getDueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
                contentStream.endText();
                currentY -= 40;

                // From/To Section
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText("From:");
                contentStream.endText();

                contentStream.beginText();
                contentStream.newLineAtOffset(300, currentY);
                contentStream.showText("To:");
                contentStream.endText();
                currentY -= 20;

                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText(invoice.getFreelancer().getFullName());
                contentStream.endText();

                contentStream.beginText();
                contentStream.newLineAtOffset(300, currentY);
                contentStream.showText(invoice.getClient().getFullName());
                contentStream.endText();
                currentY -= 40;

                // Items Table Header
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                float tableY = currentY;
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, tableY);
                contentStream.showText("Description");
                contentStream.endText();

                contentStream.beginText();
                contentStream.newLineAtOffset(250, tableY);
                contentStream.showText("Qty");
                contentStream.endText();

                contentStream.beginText();
                contentStream.newLineAtOffset(300, tableY);
                contentStream.showText("Price");
                contentStream.endText();

                contentStream.beginText();
                contentStream.newLineAtOffset(400, tableY);
                contentStream.showText("Amount");
                contentStream.endText();

                // Draw line
                contentStream.moveTo(margin, tableY - 5);
                contentStream.lineTo(500, tableY - 5);
                contentStream.stroke();

                currentY = tableY - 25;

                // Invoice Items
                List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                for (InvoiceItem item : items) {
                    if (currentY < 200) {
                        // New page if needed
                        contentStream.close();
                        PDPage newPage = new PDPage();
                        document.addPage(newPage);
                        contentStream = new PDPageContentStream(document, newPage);
                        currentY = 750;
                    }

                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, currentY);
                    String description = item.getDescription();
                    if (description.length() > 40) {
                        description = description.substring(0, 37) + "...";
                    }
                    contentStream.showText(description);
                    contentStream.endText();

                    contentStream.beginText();
                    contentStream.newLineAtOffset(250, currentY);
                    contentStream.showText(item.getQuantity().toString());
                    contentStream.endText();

                    contentStream.beginText();
                    contentStream.newLineAtOffset(300, currentY);
                    contentStream.showText(formatCurrency(item.getUnitPrice(), invoice.getCurrency()));
                    contentStream.endText();

                    contentStream.beginText();
                    contentStream.newLineAtOffset(400, currentY);
                    contentStream.showText(formatCurrency(item.getAmount(), invoice.getCurrency()));
                    contentStream.endText();

                    currentY -= 20;
                }

                currentY -= 20;

                // Totals
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(300, currentY);
                contentStream.showText("Subtotal:");
                contentStream.endText();
                contentStream.beginText();
                contentStream.newLineAtOffset(400, currentY);
                contentStream.showText(formatCurrency(invoice.getSubtotal(), invoice.getCurrency()));
                contentStream.endText();
                currentY -= 15;

                if (invoice.getTaxRate().compareTo(BigDecimal.ZERO) > 0) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(300, currentY);
                    contentStream.showText("Tax (" + invoice.getTaxRate() + "%):");
                    contentStream.endText();
                    contentStream.beginText();
                    contentStream.newLineAtOffset(400, currentY);
                    contentStream.showText(formatCurrency(invoice.getTaxAmount(), invoice.getCurrency()));
                    contentStream.endText();
                    currentY -= 15;
                }

                if (invoice.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(300, currentY);
                    contentStream.showText("Discount:");
                    contentStream.endText();
                    contentStream.beginText();
                    contentStream.newLineAtOffset(400, currentY);
                    contentStream.showText("-" + formatCurrency(invoice.getDiscount(), invoice.getCurrency()));
                    contentStream.endText();
                    currentY -= 15;
                }

                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(300, currentY);
                contentStream.showText("Total:");
                contentStream.endText();
                contentStream.beginText();
                contentStream.newLineAtOffset(400, currentY);
                contentStream.showText(formatCurrency(invoice.getTotalAmount(), invoice.getCurrency()));
                contentStream.endText();
                currentY -= 30;

                // Notes and Terms
                if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, currentY);
                    contentStream.showText("Notes: " + invoice.getNotes());
                    contentStream.endText();
                    currentY -= 20;
                }

                if (invoice.getTerms() != null && !invoice.getTerms().isEmpty()) {
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, currentY);
                    contentStream.showText("Terms: " + invoice.getTerms());
                    contentStream.endText();
                }
            } finally {
                if (contentStream != null) {
                    contentStream.close();
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    private String formatCurrency(BigDecimal amount, String currency) {
        if ("NPR".equals(currency)) {
            return "Rs. " + amount.setScale(2, java.math.RoundingMode.HALF_UP).toString();
        }
        return currency + " " + amount.setScale(2, java.math.RoundingMode.HALF_UP).toString();
    }
}

