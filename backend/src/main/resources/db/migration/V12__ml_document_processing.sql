-- Document Processing Table
CREATE TABLE document_processings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  uploaded_by_id BIGINT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- PDF, PNG, JPG, etc.
  file_size_bytes BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
  ocr_text TEXT, -- Extracted text from OCR
  extracted_tasks_count INT DEFAULT 0,
  processing_started_at TIMESTAMP,
  processing_completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_doc_processing_project (project_id),
  INDEX idx_doc_processing_status (status)
);

-- Extracted Task Suggestions Table (before user approval)
CREATE TABLE extracted_task_suggestions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_processing_id BIGINT NOT NULL,
  suggested_title VARCHAR(255) NOT NULL,
  suggested_description TEXT,
  suggested_priority VARCHAR(50), -- LOW, MEDIUM, HIGH, CRITICAL
  suggested_due_date DATE,
  suggested_estimated_hours INT,
  confidence_score DECIMAL(5,2), -- 0.00 to 1.00
  extraction_method VARCHAR(50), -- OCR_PATTERN, NLP_EXTRACTION, etc.
  raw_text_snippet TEXT, -- Original text that led to this suggestion
  line_number INT, -- Line number in document where this was found
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, MODIFIED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_processing_id) REFERENCES document_processings(id) ON DELETE CASCADE,
  INDEX idx_extracted_task_doc (document_processing_id),
  INDEX idx_extracted_task_status (status)
);

