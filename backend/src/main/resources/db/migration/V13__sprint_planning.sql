-- Sprint Planning Tables
CREATE TABLE sprints (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal TEXT,
  status VARCHAR(50) DEFAULT 'PLANNED', -- PLANNED, ACTIVE, COMPLETED, CANCELLED
  created_by_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sprint_project (project_id),
  INDEX idx_sprint_status (status),
  INDEX idx_sprint_dates (start_date, end_date)
);

-- Sprint Tasks (many-to-many relationship)
CREATE TABLE sprint_tasks (
  sprint_id BIGINT NOT NULL,
  task_id BIGINT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sprint_id, task_id),
  FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_sprint_tasks_sprint (sprint_id),
  INDEX idx_sprint_tasks_task (task_id)
);

