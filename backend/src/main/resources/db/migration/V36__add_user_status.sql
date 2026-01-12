-- Add status column to users table
ALTER TABLE users
ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';

-- Update existing users to ACTIVE status
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
