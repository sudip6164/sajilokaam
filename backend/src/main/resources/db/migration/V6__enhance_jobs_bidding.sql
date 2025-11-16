-- Job Categories
CREATE TABLE job_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Skills
CREATE TABLE job_skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  category_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
  INDEX idx_skills_category (category_id)
);

-- Job Templates
CREATE TABLE job_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category_id BIGINT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  job_type VARCHAR(50),
  experience_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL
);

-- Enhanced Jobs table
ALTER TABLE jobs
  ADD COLUMN category_id BIGINT,
  ADD COLUMN job_type VARCHAR(50) DEFAULT 'FIXED_PRICE',
  ADD COLUMN budget_min DECIMAL(12,2),
  ADD COLUMN budget_max DECIMAL(12,2),
  ADD COLUMN experience_level VARCHAR(50),
  ADD COLUMN duration_hours INT,
  ADD COLUMN expires_at TIMESTAMP,
  ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
  ADD FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
  ADD INDEX idx_jobs_category (category_id),
  ADD INDEX idx_jobs_type (job_type),
  ADD INDEX idx_jobs_status (status),
  ADD INDEX idx_jobs_featured (is_featured);

-- Job Skills Junction Table
CREATE TABLE job_required_skills (
  job_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  PRIMARY KEY (job_id, skill_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES job_skills(id) ON DELETE CASCADE
);

-- Saved Jobs (Bookmarks)
CREATE TABLE saved_jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  job_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_saved_job (user_id, job_id),
  INDEX idx_saved_jobs_user (user_id),
  INDEX idx_saved_jobs_job (job_id)
);

-- Insert default categories
INSERT INTO job_categories (name, description) VALUES
('Web Development', 'Frontend, backend, full-stack web development'),
('Mobile Development', 'iOS, Android, React Native, Flutter'),
('Design', 'UI/UX design, graphic design, branding'),
('Writing', 'Content writing, copywriting, technical writing'),
('Marketing', 'Digital marketing, SEO, social media'),
('Data Science', 'Machine learning, data analysis, AI'),
('DevOps', 'Cloud infrastructure, CI/CD, deployment'),
('Other', 'Other job categories');

-- Insert default skills
INSERT INTO job_skills (name, category_id) VALUES
-- Web Development
('React', 1), ('Vue.js', 1), ('Angular', 1), ('Node.js', 1), ('Python', 1), ('Java', 1), ('PHP', 1),
-- Mobile Development
('iOS', 2), ('Android', 2), ('React Native', 2), ('Flutter', 2), ('Swift', 2), ('Kotlin', 2),
-- Design
('Figma', 3), ('Adobe XD', 3), ('Photoshop', 3), ('Illustrator', 3), ('Sketch', 3),
-- Writing
('Content Writing', 4), ('Copywriting', 4), ('Technical Writing', 4), ('SEO Writing', 4),
-- Marketing
('SEO', 5), ('Social Media Marketing', 5), ('Google Ads', 5), ('Facebook Ads', 5),
-- Data Science
('Machine Learning', 6), ('Data Analysis', 6), ('Python', 6), ('R', 6),
-- DevOps
('AWS', 7), ('Docker', 7), ('Kubernetes', 7), ('CI/CD', 7);

