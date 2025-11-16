package com.sajilokaam.mldocument;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentProcessingRepository extends JpaRepository<DocumentProcessing, Long> {
    List<DocumentProcessing> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<DocumentProcessing> findByStatus(String status);
}

