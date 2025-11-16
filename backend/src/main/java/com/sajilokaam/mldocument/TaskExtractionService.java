package com.sajilokaam.mldocument;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TaskExtractionService {

    // Patterns for task extraction
    private static final Pattern TASK_NUMBER_PATTERN = Pattern.compile(
        "(?i)(?:task|item|step|requirement|feature|deliverable)\\s*[#:]?\\s*(\\d+)[\\.:]?\\s*(.+?)(?=(?:task|item|step|requirement|feature|deliverable)\\s*[#:]?\\s*\\d+|$)",
        Pattern.DOTALL
    );

    private static final Pattern BULLET_PATTERN = Pattern.compile(
        "(?i)^[\\*\\-\\+]\\s+(.+?)(?=^[\\*\\-\\+]|$)",
        Pattern.MULTILINE | Pattern.DOTALL
    );

    private static final Pattern NUMBERED_LIST_PATTERN = Pattern.compile(
        "(?i)^(\\d+)[\\.\\)]\\s+(.+?)(?=^\\d+[\\.\\)]|$)",
        Pattern.MULTILINE | Pattern.DOTALL
    );

    private static final Pattern PRIORITY_PATTERN = Pattern.compile(
        "(?i)\\b(?:priority|prio|urgent|important|critical|high|medium|low)\\s*[:]?\\s*(high|medium|low|critical|urgent)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DUE_DATE_PATTERN = Pattern.compile(
        "(?i)\\b(?:due|deadline|by|before|on)\\s*(?:date|date)?\\s*[:]?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\w*\\s+\\d{1,2},?\\s+\\d{4})",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ESTIMATED_HOURS_PATTERN = Pattern.compile(
        "(?i)\\b(?:estimate|estimated|hours|hrs|time|duration)\\s*[:]?\\s*(\\d+)\\s*(?:hours?|hrs?|h)?",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Extract task suggestions from OCR text
     */
    public List<ExtractedTaskSuggestion> extractTasks(String ocrText, Long documentProcessingId) {
        List<ExtractedTaskSuggestion> suggestions = new ArrayList<>();
        
        if (ocrText == null || ocrText.trim().isEmpty()) {
            return suggestions;
        }

        // Split text into lines for line number tracking
        String[] lines = ocrText.split("\n");
        
        // Try different extraction methods
        suggestions.addAll(extractFromTaskPattern(ocrText, documentProcessingId, lines));
        suggestions.addAll(extractFromBulletPoints(ocrText, documentProcessingId, lines));
        suggestions.addAll(extractFromNumberedList(ocrText, documentProcessingId, lines));

        // Remove duplicates and sort by confidence
        return deduplicateAndSort(suggestions);
    }

    /**
     * Extract tasks using task/item/step patterns
     */
    private List<ExtractedTaskSuggestion> extractFromTaskPattern(String text, Long documentProcessingId, String[] lines) {
        List<ExtractedTaskSuggestion> suggestions = new ArrayList<>();
        Matcher matcher = TASK_NUMBER_PATTERN.matcher(text);
        
        int matchCount = 0;
        while (matcher.find()) {
            matchCount++;
            String title = matcher.group(2).trim();
            String fullMatch = matcher.group(0).trim();
            
            if (title.length() < 5) continue; // Skip very short titles
            
            ExtractedTaskSuggestion suggestion = new ExtractedTaskSuggestion();
            suggestion.setDocumentProcessing(new DocumentProcessing());
            suggestion.getDocumentProcessing().setId(documentProcessingId);
            suggestion.setSuggestedTitle(cleanTitle(title));
            suggestion.setSuggestedDescription(extractDescription(fullMatch));
            suggestion.setSuggestedPriority(extractPriority(fullMatch));
            suggestion.setSuggestedDueDate(extractDueDate(fullMatch));
            suggestion.setSuggestedEstimatedHours(extractEstimatedHours(fullMatch));
            suggestion.setConfidenceScore(BigDecimal.valueOf(0.85).setScale(2, RoundingMode.HALF_UP));
            suggestion.setExtractionMethod("OCR_PATTERN");
            suggestion.setRawTextSnippet(fullMatch.substring(0, Math.min(500, fullMatch.length())));
            suggestion.setLineNumber(findLineNumber(fullMatch, lines));
            
            suggestions.add(suggestion);
        }
        
        return suggestions;
    }

    /**
     * Extract tasks from bullet points
     */
    private List<ExtractedTaskSuggestion> extractFromBulletPoints(String text, Long documentProcessingId, String[] lines) {
        List<ExtractedTaskSuggestion> suggestions = new ArrayList<>();
        Matcher matcher = BULLET_PATTERN.matcher(text);
        
        while (matcher.find()) {
            String content = matcher.group(1).trim();
            
            if (content.length() < 10) continue; // Skip very short items
            
            // Check if it looks like a task (contains action verbs or task keywords)
            if (!isLikelyTask(content)) continue;
            
            ExtractedTaskSuggestion suggestion = new ExtractedTaskSuggestion();
            suggestion.setDocumentProcessing(new DocumentProcessing());
            suggestion.getDocumentProcessing().setId(documentProcessingId);
            suggestion.setSuggestedTitle(cleanTitle(content.substring(0, Math.min(255, content.length()))));
            suggestion.setSuggestedDescription(content.length() > 255 ? content : null);
            suggestion.setSuggestedPriority(extractPriority(content));
            suggestion.setSuggestedDueDate(extractDueDate(content));
            suggestion.setSuggestedEstimatedHours(extractEstimatedHours(content));
            suggestion.setConfidenceScore(BigDecimal.valueOf(0.70).setScale(2, RoundingMode.HALF_UP));
            suggestion.setExtractionMethod("BULLET_PATTERN");
            suggestion.setRawTextSnippet(content.substring(0, Math.min(500, content.length())));
            suggestion.setLineNumber(findLineNumber(content, lines));
            
            suggestions.add(suggestion);
        }
        
        return suggestions;
    }

    /**
     * Extract tasks from numbered lists
     */
    private List<ExtractedTaskSuggestion> extractFromNumberedList(String text, Long documentProcessingId, String[] lines) {
        List<ExtractedTaskSuggestion> suggestions = new ArrayList<>();
        Matcher matcher = NUMBERED_LIST_PATTERN.matcher(text);
        
        while (matcher.find()) {
            String content = matcher.group(2).trim();
            
            if (content.length() < 10) continue;
            
            if (!isLikelyTask(content)) continue;
            
            ExtractedTaskSuggestion suggestion = new ExtractedTaskSuggestion();
            suggestion.setDocumentProcessing(new DocumentProcessing());
            suggestion.getDocumentProcessing().setId(documentProcessingId);
            suggestion.setSuggestedTitle(cleanTitle(content.substring(0, Math.min(255, content.length()))));
            suggestion.setSuggestedDescription(content.length() > 255 ? content : null);
            suggestion.setSuggestedPriority(extractPriority(content));
            suggestion.setSuggestedDueDate(extractDueDate(content));
            suggestion.setSuggestedEstimatedHours(extractEstimatedHours(content));
            suggestion.setConfidenceScore(BigDecimal.valueOf(0.75).setScale(2, RoundingMode.HALF_UP));
            suggestion.setExtractionMethod("NUMBERED_LIST");
            suggestion.setRawTextSnippet(content.substring(0, Math.min(500, content.length())));
            suggestion.setLineNumber(findLineNumber(content, lines));
            
            suggestions.add(suggestion);
        }
        
        return suggestions;
    }

    /**
     * Check if text looks like a task (contains action verbs or task keywords)
     */
    private boolean isLikelyTask(String text) {
        String lower = text.toLowerCase();
        String[] taskKeywords = {
            "implement", "create", "develop", "build", "design", "write", "test", "fix", "update",
            "add", "remove", "modify", "improve", "refactor", "deploy", "configure", "setup",
            "task", "feature", "requirement", "deliverable", "milestone", "sprint", "story"
        };
        
        for (String keyword : taskKeywords) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Extract priority from text
     */
    private String extractPriority(String text) {
        Matcher matcher = PRIORITY_PATTERN.matcher(text);
        if (matcher.find()) {
            String priority = matcher.group(1).toUpperCase();
            if (priority.contains("CRITICAL") || priority.contains("URGENT")) {
                return "CRITICAL";
            } else if (priority.contains("HIGH")) {
                return "HIGH";
            } else if (priority.contains("MEDIUM")) {
                return "MEDIUM";
            } else if (priority.contains("LOW")) {
                return "LOW";
            }
        }
        return "MEDIUM"; // Default
    }

    /**
     * Extract due date from text
     */
    private LocalDate extractDueDate(String text) {
        Matcher matcher = DUE_DATE_PATTERN.matcher(text);
        if (matcher.find()) {
            String dateStr = matcher.group(1);
            try {
                // Try different date formats
                DateTimeFormatter[] formatters = {
                    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                    DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                    DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                    DateTimeFormatter.ofPattern("MM-dd-yyyy"),
                    DateTimeFormatter.ofPattern("MMMM d, yyyy")
                };
                
                for (DateTimeFormatter formatter : formatters) {
                    try {
                        return LocalDate.parse(dateStr, formatter);
                    } catch (DateTimeParseException e) {
                        // Try next format
                    }
                }
            } catch (Exception e) {
                // Could not parse date
            }
        }
        return null;
    }

    /**
     * Extract estimated hours from text
     */
    private Integer extractEstimatedHours(String text) {
        Matcher matcher = ESTIMATED_HOURS_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                // Could not parse
            }
        }
        return null;
    }

    /**
     * Clean and format title
     */
    private String cleanTitle(String title) {
        // Remove extra whitespace
        title = title.replaceAll("\\s+", " ").trim();
        // Remove common prefixes
        title = title.replaceAll("^(?:task|item|step|requirement|feature|deliverable)\\s*[#:]?\\s*\\d+[\\.:]?\\s*", "");
        // Capitalize first letter
        if (!title.isEmpty()) {
            title = Character.toUpperCase(title.charAt(0)) + title.substring(1);
        }
        return title;
    }

    /**
     * Extract description from full match (everything after title)
     */
    private String extractDescription(String fullMatch) {
        // For now, return null - can be enhanced to extract multi-line descriptions
        return null;
    }

    /**
     * Find line number where text appears
     */
    private Integer findLineNumber(String text, String[] lines) {
        String searchText = text.substring(0, Math.min(50, text.length())).trim();
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].contains(searchText)) {
                return i + 1; // 1-indexed
            }
        }
        return null;
    }

    /**
     * Remove duplicates and sort by confidence
     */
    private List<ExtractedTaskSuggestion> deduplicateAndSort(List<ExtractedTaskSuggestion> suggestions) {
        // Simple deduplication based on title similarity
        List<ExtractedTaskSuggestion> unique = new ArrayList<>();
        for (ExtractedTaskSuggestion suggestion : suggestions) {
            boolean isDuplicate = false;
            for (ExtractedTaskSuggestion existing : unique) {
                if (areSimilar(suggestion.getSuggestedTitle(), existing.getSuggestedTitle())) {
                    // Keep the one with higher confidence
                    if (suggestion.getConfidenceScore().compareTo(existing.getConfidenceScore()) > 0) {
                        unique.remove(existing);
                        unique.add(suggestion);
                    }
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                unique.add(suggestion);
            }
        }
        
        // Sort by confidence (descending)
        unique.sort((a, b) -> b.getConfidenceScore().compareTo(a.getConfidenceScore()));
        
        return unique;
    }

    /**
     * Check if two titles are similar (simple string similarity)
     */
    private boolean areSimilar(String title1, String title2) {
        if (title1 == null || title2 == null) return false;
        String t1 = title1.toLowerCase().trim();
        String t2 = title2.toLowerCase().trim();
        
        // Exact match
        if (t1.equals(t2)) return true;
        
        // One contains the other (for partial matches)
        if (t1.length() > 10 && t2.length() > 10) {
            if (t1.contains(t2) || t2.contains(t1)) {
                return true;
            }
        }
        
        // Calculate simple similarity (Levenshtein-like)
        int maxLen = Math.max(t1.length(), t2.length());
        if (maxLen == 0) return true;
        
        int distance = levenshteinDistance(t1, t2);
        double similarity = 1.0 - (double) distance / maxLen;
        
        return similarity > 0.8; // 80% similarity threshold
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
}

