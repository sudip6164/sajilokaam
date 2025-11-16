-- Conversations (for project-based messaging)
CREATE TABLE conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_conversations_project (project_id)
);

-- Conversation Participants
CREATE TABLE conversation_participants (
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_participants_conversation (conversation_id),
  INDEX idx_participants_user (user_id)
);

-- Messages
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'TEXT', -- TEXT, RICH_TEXT, FILE
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation (conversation_id),
  INDEX idx_messages_sender (sender_id),
  INDEX idx_messages_created (created_at)
);

-- Message Attachments
CREATE TABLE message_attachments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  message_id BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_attachments_message (message_id)
);

-- Notifications
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL, -- MESSAGE, TASK_ASSIGNED, TASK_UPDATED, BID_ACCEPTED, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(100), -- TASK, PROJECT, JOB, BID, etc.
  entity_id BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_created (created_at)
);

-- Direct Messages (1-on-1 conversations)
CREATE TABLE direct_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'TEXT',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dm_sender (sender_id),
  INDEX idx_dm_receiver (receiver_id),
  INDEX idx_dm_created (created_at)
);

