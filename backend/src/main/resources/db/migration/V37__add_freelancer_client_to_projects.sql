-- Add freelancer and client relationships to projects table
ALTER TABLE projects 
ADD COLUMN freelancer_id BIGINT,
ADD COLUMN client_id BIGINT,
ADD COLUMN budget DECIMAL(10, 2),
ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN completed_at TIMESTAMP;

-- Add foreign key constraints
ALTER TABLE projects
ADD CONSTRAINT fk_projects_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id),
ADD CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES users(id);

-- Add indexes for better query performance
CREATE INDEX idx_projects_freelancer ON projects(freelancer_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
