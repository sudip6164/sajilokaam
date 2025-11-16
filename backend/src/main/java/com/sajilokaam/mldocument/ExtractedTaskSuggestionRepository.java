package com.sajilokaam.mldocument;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExtractedTaskSuggestionRepository extends JpaRepository<ExtractedTaskSuggestion, Long> {
    List<ExtractedTaskSuggestion> findByDocumentProcessingIdOrderByConfidenceScoreDesc(Long documentProcessingId);
    List<ExtractedTaskSuggestion> findByDocumentProcessingIdAndStatus(Long documentProcessingId, String status);
}

