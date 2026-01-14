package com.sajilokaam.mldocument;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
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
     * Extract text from a file (PDF, image, or text file)
     */
    public String extractText(Path filePath, String fileType) throws IOException, TesseractException {
        if (fileType == null) {
            fileType = "";
        }

        String lowerType = fileType.toLowerCase();
        String filePathLower = filePath.toString().toLowerCase();
        
        // Handle text files - just read directly
        if (lowerType.equals("txt") || filePathLower.endsWith(".txt")) {
            return extractTextFromTxt(filePath);
        }
        
        // Handle PDF files
        if (lowerType.equals("pdf") || filePathLower.endsWith(".pdf")) {
            return extractTextFromPdf(filePath);
        }
        
        // Handle DOC/DOCX files (if Apache POI is available)
        if (lowerType.equals("doc") || filePathLower.endsWith(".doc")) {
            return extractTextFromDoc(filePath);
        }
        if (lowerType.equals("docx") || filePathLower.endsWith(".docx")) {
            return extractTextFromDocx(filePath);
        }
        
        // Handle image files
        if (lowerType.equals("png") || lowerType.equals("jpg") || lowerType.equals("jpeg") || 
                   lowerType.equals("gif") || lowerType.equals("bmp") ||
                   filePathLower.matches(".*\\.(png|jpg|jpeg|gif|bmp)$")) {
            return extractTextFromImage(filePath);
        }
        
        // If file type is UNKNOWN, null, or empty, try to read as text file (common case)
        if (lowerType.equals("unknown") || fileType == null || fileType.isEmpty() || lowerType.isBlank()) {
            System.out.println("File type is UNKNOWN/null/empty, attempting to read as TXT file");
            try {
                return extractTextFromTxt(filePath);
            } catch (Exception e) {
                System.err.println("Failed to read as TXT: " + e.getMessage());
                // Try PDF as fallback
                try {
                    System.out.println("Trying PDF format as fallback...");
                    return extractTextFromPdf(filePath);
                } catch (Exception e2) {
                    System.err.println("Failed to read as PDF: " + e2.getMessage());
                    throw new UnsupportedOperationException(
                        "Unsupported file type: " + fileType + ". Please ensure your file has a .txt or .pdf extension. Error: " + e.getMessage()
                    );
                }
            }
        }
        
        throw new UnsupportedOperationException("Unsupported file type: " + fileType);
    }
    
    /**
     * Extract text from plain text file
     */
    private String extractTextFromTxt(Path filePath) throws IOException {
        return new String(java.nio.file.Files.readAllBytes(filePath), java.nio.charset.StandardCharsets.UTF_8);
    }
    
    /**
     * Extract text from DOC file (requires Apache POI - not currently supported)
     */
    private String extractTextFromDoc(Path filePath) throws IOException {
        throw new UnsupportedOperationException(
            "DOC file format is not currently supported. Please convert your document to TXT or PDF format for processing."
        );
    }
    
    /**
     * Extract text from DOCX file (requires Apache POI - not currently supported)
     */
    private String extractTextFromDocx(Path filePath) throws IOException {
        throw new UnsupportedOperationException(
            "DOCX file format is not currently supported. Please convert your document to TXT or PDF format for processing."
        );
    }

    /**
     * Extract text from PDF using PDFBox
     */
    private String extractTextFromPdf(Path filePath) throws IOException {
        try (PDDocument document = Loader.loadPDF(filePath.toFile())) {
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

