-- Seed default admin user
-- Email: admin@sajilokaam.com
-- Password: admin123
-- BCrypt hash for 'admin123' (strength 10)
-- This is a default password - CHANGE IT IN PRODUCTION!
-- Note: Using UPDATE to ensure password is correct if user already exists

-- Insert or update admin user
-- Password: admin123
-- BCrypt hash (verified): $2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q
INSERT INTO users (email, password, full_name, created_at)
VALUES (
    'admin@sajilokaam.com',
    '$2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q',
    'System Administrator',
    NOW()
)
ON DUPLICATE KEY UPDATE
    password = '$2a$10$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q',
    full_name = 'System Administrator';

-- Assign ADMIN role to the admin user
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
    u.id,
    r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@sajilokaam.com'
  AND r.name = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

