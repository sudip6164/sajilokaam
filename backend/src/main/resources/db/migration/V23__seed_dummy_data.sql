-- Seed dummy data for testing
-- Users: 2 freelancers, 2 clients, 1 admin (already exists)
-- Password for all: "password"
-- BCrypt hash for "password" (strength 10): $2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q
-- Note: This hash will be updated by the backend's PasswordEncoder on startup

-- Insert 2 Freelancers
INSERT IGNORE INTO users (email, password, full_name, created_at) VALUES
('freelancer1@example.com', '$2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q', 'Rajesh Kumar', NOW()),
('freelancer2@example.com', '$2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q', 'Priya Sharma', NOW());

-- Insert 2 Clients
INSERT IGNORE INTO users (email, password, full_name, created_at) VALUES
('client1@example.com', '$2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q', 'Amit Patel', NOW()),
('client2@example.com', '$2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q', 'Sita Devi', NOW());

-- Assign FREELANCER role to freelancers
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email IN ('freelancer1@example.com', 'freelancer2@example.com')
  AND r.name = 'FREELANCER'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Assign CLIENT role to clients
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email IN ('client1@example.com', 'client2@example.com')
  AND r.name = 'CLIENT'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Create jobs for clients
INSERT IGNORE INTO jobs (client_id, title, description, status, budget_min, budget_max, job_type, created_at)
SELECT 
    u.id,
    'Build E-commerce Website',
    'Looking for an experienced developer to build a modern e-commerce website with React and Node.js. Must have experience with payment integration.',
    'OPEN',
    50000.00,
    100000.00,
    'FIXED_PRICE',
    NOW()
FROM users u
WHERE u.email = 'client1@example.com'
LIMIT 1;

INSERT IGNORE INTO jobs (client_id, title, description, status, budget_min, budget_max, job_type, created_at)
SELECT 
    u.id,
    'Mobile App Development',
    'Need a React Native developer to create a mobile app for iOS and Android. Should include user authentication and real-time features.',
    'OPEN',
    80000.00,
    150000.00,
    'FIXED_PRICE',
    NOW()
FROM users u
WHERE u.email = 'client2@example.com'
LIMIT 1;

-- Create bids from freelancers
INSERT IGNORE INTO bids (job_id, freelancer_id, amount, message, status, created_at)
SELECT 
    j.id,
    f.id,
    75000.00,
    'I have 5 years of experience building e-commerce platforms. I can deliver this project within 2 months.',
    'PENDING',
    NOW()
FROM jobs j
CROSS JOIN users f
WHERE j.title = 'Build E-commerce Website'
  AND f.email = 'freelancer1@example.com'
LIMIT 1;

INSERT IGNORE INTO bids (job_id, freelancer_id, amount, message, status, created_at)
SELECT 
    j.id,
    f.id,
    120000.00,
    'I specialize in React Native development and have built 10+ mobile apps. I can start immediately.',
    'PENDING',
    NOW()
FROM jobs j
CROSS JOIN users f
WHERE j.title = 'Mobile App Development'
  AND f.email = 'freelancer2@example.com'
LIMIT 1;

-- Create 1 project associated with client1 and freelancer1
-- First, accept a bid to create the project
UPDATE bids b
INNER JOIN jobs j ON b.job_id = j.id
INNER JOIN users f ON b.freelancer_id = f.id
SET b.status = 'ACCEPTED', j.status = 'IN_PROGRESS'
WHERE j.title = 'Build E-commerce Website'
  AND f.email = 'freelancer1@example.com'
LIMIT 1;

-- Create the project
INSERT IGNORE INTO projects (job_id, title, description, created_at)
SELECT 
    j.id,
    'E-commerce Website Development',
    'Full-stack e-commerce website with React frontend and Node.js backend. Includes payment integration, user authentication, and admin dashboard.',
    NOW()
FROM jobs j
INNER JOIN users c ON j.client_id = c.id
WHERE c.email = 'client1@example.com'
  AND j.title = 'Build E-commerce Website'
LIMIT 1;

-- Create some tasks for the project
INSERT IGNORE INTO tasks (project_id, assignee_id, title, description, status, created_at)
SELECT 
    p.id,
    f.id,
    'Setup Project Structure',
    'Initialize React and Node.js projects with proper folder structure and dependencies',
    'IN_PROGRESS',
    NOW()
FROM projects p
INNER JOIN jobs j ON p.job_id = j.id
INNER JOIN users f ON j.client_id = f.id
CROSS JOIN users freelancer
WHERE p.title = 'E-commerce Website Development'
  AND freelancer.email = 'freelancer1@example.com'
LIMIT 1;

INSERT IGNORE INTO tasks (project_id, assignee_id, title, description, status, created_at)
SELECT 
    p.id,
    f.id,
    'Implement User Authentication',
    'Create login, register, and password reset functionality',
    'TODO',
    NOW()
FROM projects p
INNER JOIN jobs j ON p.job_id = j.id
CROSS JOIN users f
WHERE p.title = 'E-commerce Website Development'
  AND f.email = 'freelancer1@example.com'
LIMIT 1;

