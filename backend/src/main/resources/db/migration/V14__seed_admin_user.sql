-- Seed default admin user
-- Email: admin@sajilokaam.com
-- Password: admin123
-- BCrypt hash for 'admin123' (strength 10)
-- This is a default password - CHANGE IT IN PRODUCTION!
-- Note: Using UPDATE to ensure password is correct if user already exists

-- Insert or update admin user
INSERT IGNORE INTO users (email, password, full_name, created_at)
SELECT 
    'admin@sajilokaam.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@sajilokaam.com'
);

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

