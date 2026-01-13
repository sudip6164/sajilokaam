-- Add isDeleted and deletedAt columns to messages table
ALTER TABLE messages
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN deleted_at TIMESTAMP(6);
