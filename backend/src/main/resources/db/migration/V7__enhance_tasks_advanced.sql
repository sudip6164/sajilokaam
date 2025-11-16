-- Task Priorities
ALTER TABLE tasks
  ADD COLUMN priority VARCHAR(50) DEFAULT 'MEDIUM',
  ADD COLUMN estimated_hours INT,
  ADD INDEX idx_tasks_priority (priority);

-- Task Labels
CREATE TABLE task_labels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Labels Junction Table
CREATE TABLE task_label_assignments (
  task_id BIGINT NOT NULL,
  label_id BIGINT NOT NULL,
  PRIMARY KEY (task_id, label_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES task_labels(id) ON DELETE CASCADE,
  INDEX idx_task_labels_task (task_id),
  INDEX idx_task_labels_label (label_id)
);

-- Task Dependencies
CREATE TABLE task_dependencies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  depends_on_task_id BIGINT NOT NULL,
  dependency_type VARCHAR(50) DEFAULT 'BLOCKS', -- BLOCKS, BLOCKED_BY
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dependency (task_id, depends_on_task_id),
  INDEX idx_dependencies_task (task_id),
  INDEX idx_dependencies_depends_on (depends_on_task_id)
);

-- Task Links
CREATE TABLE task_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  linked_task_id BIGINT NOT NULL,
  link_type VARCHAR(50) NOT NULL, -- RELATES_TO, DUPLICATES, CLONES
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_links_task (task_id),
  INDEX idx_links_linked (linked_task_id)
);

-- Task Watchers
CREATE TABLE task_watchers (
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_watchers_task (task_id),
  INDEX idx_watchers_user (user_id)
);

-- Task Templates
CREATE TABLE task_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  estimated_hours INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Activity Feed
CREATE TABLE task_activities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  user_id BIGINT,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_activities_task (task_id),
  INDEX idx_activities_created (created_at)
);

-- Insert default task labels
INSERT INTO task_labels (name, color) VALUES
('Bug', '#ef4444'),
('Feature', '#10b981'),
('Enhancement', '#3b82f6'),
('Documentation', '#8b5cf6'),
('Urgent', '#f59e0b'),
('Low Priority', '#6b7280');

