package com.sajilokaam.mldocument;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class OcrService {

    private final Tesseract tesseract;

    public OcrService() {
        this.tesseract = new Tesseract();
        // Set Tesseract data path (adjust based on your installation)
        // For production, you may need to configure this path
        try {
            // Try to set data path - adjust if needed
            String tessDataPath = System.getenv("TESSDATA_PREFIX");
            if (tessDataPath != null && !tessDataPath.isEmpty()) {
                tesseract.setDatapath(tessDataPath);
            }
            // Set language (English by default, can be extended)
            tesseract.setLanguage("eng");
        } catch (Exception e) {
            System.err.println("Warning: Could not configure Tesseract data path: " + e.getMessage());
        }
    }

    /**
     * Extract text from a file (PDF or image)
     */
    public String extractText(Path filePath, String fileType) throws IOException, TesseractException {
        if (fileType == null) {
            fileType = "";
        }

        String lowerType = fileType.toLowerCase();
        
        if (lowerType.equals("pdf") || filePath.toString().toLowerCase().endsWith(".pdf")) {
            return extractTextFromPdf(filePath);
        } else if (lowerType.equals("png") || lowerType.equals("jpg") || lowerType.equals("jpeg") || 
                   lowerType.equals("gif") || lowerType.equals("bmp") ||
                   filePath.toString().toLowerCase().matches(".*\\.(png|jpg|jpeg|gif|bmp)$")) {
            return extractTextFromImage(filePath);
        } else {
            throw new UnsupportedOperationException("Unsupported file type: " + fileType);
        }
    }

    /**
     * Extract text from PDF using PDFBox
     */
    private String extractTextFromPdf(Path filePath) throws IOException {
        try (PDDocument document = PDDocument.load(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    /**
     * Extract text from image using Tesseract OCR
     */
    private String extractTextFromImage(Path filePath) throws IOException, TesseractException {
        BufferedImage image = ImageIO.read(filePath.toFile());
        if (image == null) {
            throw new IOException("Could not read image from: " + filePath);
        }
        return tesseract.doOCR(image);
    }
}

