ALTER TABLE comments
    ADD COLUMN parent_comment_id BIGINT NULL,
    ADD COLUMN mentions TEXT NULL,
    ADD COLUMN is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    ADD CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;

CREATE INDEX idx_comments_parent ON comments(parent_comment_id);


