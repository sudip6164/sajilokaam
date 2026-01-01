-- Fix admin password - regenerate with correct BCrypt hash for 'admin123'
-- This will be updated by the backend's PasswordEncoder on next restart
-- For now, using a verified hash that matches 'admin123'
UPDATE users 
SET password = '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM8A8Y6rqY1pU5K5Q5Qe'
WHERE email = 'admin@sajilokaam.com';

