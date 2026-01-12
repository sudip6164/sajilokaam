-- Seed test users (2 freelancers + 2 clients)
-- Password for all test users: "password123"
-- BCrypt hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Insert Users
INSERT INTO users (full_name, email, password, email_verified, created_at)
VALUES 
    ('John Developer', 'john.dev@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NOW()),
    ('Sarah Designer', 'sarah.designer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NOW()),
    ('TechCorp Client', 'tech@corp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NOW()),
    ('StartupX Client', 'hello@startup.io', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, NOW());

-- Get user IDs
SET @john_id = (SELECT id FROM users WHERE email = 'john.dev@example.com');
SET @sarah_id = (SELECT id FROM users WHERE email = 'sarah.designer@example.com');
SET @techcorp_id = (SELECT id FROM users WHERE email = 'tech@corp.com');
SET @startup_id = (SELECT id FROM users WHERE email = 'hello@startup.io');

-- Get FREELANCER and CLIENT role IDs
SET @freelancer_role_id = (SELECT id FROM roles WHERE name = 'FREELANCER');
SET @client_role_id = (SELECT id FROM roles WHERE name = 'CLIENT');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
    (@john_id, @freelancer_role_id),
    (@sarah_id, @freelancer_role_id),
    (@techcorp_id, @client_role_id),
    (@startup_id, @client_role_id);

-- Insert Freelancer Profiles (minimal fields)
INSERT INTO freelancer_profiles (user_id, created_at)
VALUES 
    (@john_id, NOW()),
    (@sarah_id, NOW());

-- Insert Client Profiles (minimal fields)
INSERT INTO client_profiles (user_id, created_at)
VALUES 
    (@techcorp_id, NOW()),
    (@startup_id, NOW());

-- Get category IDs
SET @web_dev_cat = (SELECT id FROM job_categories WHERE name = 'Web Development' LIMIT 1);
SET @design_cat = (SELECT id FROM job_categories WHERE name = 'Design & Creative' LIMIT 1);

-- Insert Jobs (minimal columns)
INSERT INTO jobs (client_id, title, description, category_id, job_type, status, created_at)
VALUES 
    (
        @techcorp_id,
        'React Dashboard Development',
        'We need an experienced React developer to build an analytics dashboard.',
        @web_dev_cat,
        'FIXED_PRICE',
        'OPEN',
        NOW()
    ),
    (
        @startup_id,
        'Mobile App UI Design',
        'Looking for a talented UI/UX designer for our mobile app.',
        @design_cat,
        'HOURLY',
        'OPEN',
        NOW()
    );

-- Get job IDs
SET @job1_id = (SELECT id FROM jobs WHERE title = 'React Dashboard Development' AND client_id = @techcorp_id LIMIT 1);
SET @job2_id = (SELECT id FROM jobs WHERE title = 'Mobile App UI Design' AND client_id = @startup_id LIMIT 1);

-- Insert Bids (proposals) on the second job
INSERT INTO bids (job_id, freelancer_id, amount, message, status, created_at)
VALUES 
    (
        @job2_id,
        @sarah_id,
        55.00,
        'Hello! I am very excited about this opportunity. Looking forward to working with you!',
        'ACCEPTED',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        @job2_id,
        @john_id,
        60.00,
        'Hi there! I have strong UI/UX skills. Happy to provide samples of my work.',
        'PENDING',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    );
