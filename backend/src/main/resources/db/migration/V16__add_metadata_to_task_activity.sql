ALTER TABLE task_activities
    ADD COLUMN metadata TEXT;

CREATE INDEX idx_activities_type ON task_activities (action);


