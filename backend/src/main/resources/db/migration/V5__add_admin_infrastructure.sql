-- Activity Logs: Track all user actions
CREATE TABLE activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_entity (entity_type, entity_id),
  INDEX idx_activity_created (created_at)
);

-- System Settings: Platform-wide configuration
CREATE TABLE system_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  setting_type VARCHAR(50) DEFAULT 'STRING',
  updated_by BIGINT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_settings_key (setting_key)
);

-- Audit Trail: Track changes to critical entities
CREATE TABLE audit_trail (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  old_values JSON,
  new_values JSON,
  changed_fields TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, setting_type) VALUES
('platform_name', 'Sajilo Kaam', 'Platform name', 'STRING'),
('platform_email', 'admin@sajilokaam.com', 'Platform contact email', 'STRING'),
('max_file_size_mb', '5', 'Maximum file upload size in MB', 'NUMBER'),
('session_timeout_minutes', '30', 'User session timeout in minutes', 'NUMBER'),
('enable_registration', 'false', 'Allow public user registration', 'BOOLEAN'),
('maintenance_mode', 'false', 'Enable maintenance mode', 'BOOLEAN');

