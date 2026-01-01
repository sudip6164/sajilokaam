-- Reset admin password to 'admin123'
-- Run this script if admin login is not working
-- This will update the admin user's password with a verified BCrypt hash

-- First, verify the admin user exists
SELECT id, email, full_name FROM users WHERE email = 'admin@sajilokaam.com';

-- Update the password (BCrypt hash for 'admin123' with strength 10)
-- Note: This hash should match 'admin123' when verified with BCryptPasswordEncoder
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'admin@sajilokaam.com';

-- Verify the update
SELECT id, email, full_name, LEFT(password, 20) as password_hash_preview FROM users WHERE email = 'admin@sajilokaam.com';

-- Ensure ADMIN role is assigned
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@sajilokaam.com'
  AND r.name = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

