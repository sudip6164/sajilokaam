-- Add location and project_length to jobs table
ALTER TABLE jobs
  ADD COLUMN location VARCHAR(255),
  ADD COLUMN project_length VARCHAR(100);

-- Create job_details table for long text fields (requirements, deliverables)
CREATE TABLE job_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_id BIGINT NOT NULL UNIQUE,
  requirements TEXT,
  deliverables TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_job_details_job (job_id)
);

-- Add index for location filtering
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_project_length ON jobs(project_length);

