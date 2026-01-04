-- Add password reset token fields to users table
ALTER TABLE users
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires_at TIMESTAMP NULL;

-- Add index for faster lookups
CREATE INDEX idx_users_reset_token ON users(reset_token);

