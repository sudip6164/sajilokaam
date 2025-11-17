package com.sajilokaam.mldocument;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Client for calling Python ML service for task extraction
 */
@Service
public class MlTaskExtractionClient {

    @Value("${ml.service.url:http://ml-service:5000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MlTaskExtractionClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Call Python ML service to extract tasks from text
     */
    public List<ExtractedTaskSuggestion> extractTasksFromMlService(String ocrText, Long documentProcessingId) {
        try {
            // Prepare request
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", ocrText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            // Call Python ML service
            String url = mlServiceUrl + "/extract-tasks";
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> tasks = (List<Map<String, Object>>) body.get("tasks");

                if (tasks == null) {
                    return new ArrayList<>();
                }

                // Convert to ExtractedTaskSuggestion entities
                List<ExtractedTaskSuggestion> suggestions = new ArrayList<>();
                for (Map<String, Object> taskData : tasks) {
                    ExtractedTaskSuggestion suggestion = convertToSuggestion(taskData, documentProcessingId);
                    suggestions.add(suggestion);
                }

                return suggestions;
            }

            return new ArrayList<>();

        } catch (Exception e) {
            System.err.println("Error calling ML service: " + e.getMessage());
            e.printStackTrace();
            // Return empty list on error - fallback to rule-based extraction
            return new ArrayList<>();
        }
    }

    /**
     * Convert ML service response to ExtractedTaskSuggestion entity
     */
    private ExtractedTaskSuggestion convertToSuggestion(Map<String, Object> taskData, Long documentProcessingId) {
        ExtractedTaskSuggestion suggestion = new ExtractedTaskSuggestion();
        
        DocumentProcessing docProcessing = new DocumentProcessing();
        docProcessing.setId(documentProcessingId);
        suggestion.setDocumentProcessing(docProcessing);

        suggestion.setSuggestedTitle((String) taskData.get("suggestedTitle"));
        suggestion.setSuggestedDescription((String) taskData.get("suggestedDescription"));
        suggestion.setSuggestedPriority((String) taskData.get("suggestedPriority"));
        
        // Parse due date
        String dueDateStr = (String) taskData.get("suggestedDueDate");
        if (dueDateStr != null) {
            try {
                suggestion.setSuggestedDueDate(java.time.LocalDate.parse(dueDateStr));
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        // Parse estimated hours
        Object hoursObj = taskData.get("suggestedEstimatedHours");
        if (hoursObj != null) {
            if (hoursObj instanceof Integer) {
                suggestion.setSuggestedEstimatedHours((Integer) hoursObj);
            } else if (hoursObj instanceof Number) {
                suggestion.setSuggestedEstimatedHours(((Number) hoursObj).intValue());
            }
        }

        // Parse confidence score
        Object confidenceObj = taskData.get("confidenceScore");
        if (confidenceObj != null) {
            if (confidenceObj instanceof Number) {
                suggestion.setConfidenceScore(
                    java.math.BigDecimal.valueOf(((Number) confidenceObj).doubleValue())
                        .setScale(2, java.math.RoundingMode.HALF_UP)
                );
            }
        } else {
            suggestion.setConfidenceScore(java.math.BigDecimal.valueOf(0.70).setScale(2, java.math.RoundingMode.HALF_UP));
        }

        suggestion.setExtractionMethod((String) taskData.get("extractionMethod"));
        suggestion.setRawTextSnippet((String) taskData.get("rawTextSnippet"));
        
        // Parse line number
        Object lineNumberObj = taskData.get("lineNumber");
        if (lineNumberObj != null && lineNumberObj instanceof Number) {
            suggestion.setLineNumber(((Number) lineNumberObj).intValue());
        }

        suggestion.setStatus("PENDING");

        return suggestion;
    }

    /**
     * Check if ML service is available
     */
    public boolean isServiceAvailable() {
        try {
            String url = mlServiceUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }
}

