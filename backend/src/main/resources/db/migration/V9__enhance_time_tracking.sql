-- Timer Sessions Table
CREATE TABLE timer_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP,
  stopped_at TIMESTAMP,
  total_seconds INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_paused BOOLEAN DEFAULT FALSE,
  last_activity_at TIMESTAMP,
  idle_seconds INT DEFAULT 0,
  description TEXT,
  is_billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_timer_sessions_user (user_id),
  INDEX idx_timer_sessions_task (task_id),
  INDEX idx_timer_sessions_active (is_active),
  INDEX idx_timer_sessions_started (started_at)
);

-- Time Categories Table
CREATE TABLE time_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to time_logs
ALTER TABLE time_logs
  ADD COLUMN timer_session_id BIGINT,
  ADD COLUMN category_id BIGINT,
  ADD COLUMN description TEXT,
  ADD COLUMN is_billable BOOLEAN DEFAULT TRUE,
  ADD COLUMN start_time TIMESTAMP,
  ADD COLUMN end_time TIMESTAMP,
  ADD CONSTRAINT fk_timelog_session FOREIGN KEY (timer_session_id) REFERENCES timer_sessions(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_timelog_category FOREIGN KEY (category_id) REFERENCES time_categories(id) ON DELETE SET NULL,
  ADD INDEX idx_timelog_session (timer_session_id),
  ADD INDEX idx_timelog_category (category_id),
  ADD INDEX idx_timelog_billable (is_billable),
  ADD INDEX idx_timelog_logged (logged_at);

-- Time Approval Workflow
CREATE TABLE time_approvals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  time_log_id BIGINT NOT NULL,
  approver_id BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  comments TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (time_log_id) REFERENCES time_logs(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_approvals_timelog (time_log_id),
  INDEX idx_approvals_status (status)
);

-- Seed default time categories
INSERT INTO time_categories (name, description, color, is_billable) VALUES
('Development', 'Software development work', '#3b82f6', TRUE),
('Design', 'UI/UX design work', '#8b5cf6', TRUE),
('Testing', 'Quality assurance and testing', '#10b981', TRUE),
('Meeting', 'Client or team meetings', '#f59e0b', FALSE),
('Research', 'Research and learning', '#6366f1', TRUE),
('Documentation', 'Writing documentation', '#ec4899', TRUE),
('Bug Fix', 'Fixing bugs and issues', '#ef4444', TRUE),
('Review', 'Code or design review', '#14b8a6', FALSE);

