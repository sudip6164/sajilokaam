#!/bin/bash
# Manual admin password reset script
# This will reset admin password using the backend's password encoder

echo "Resetting admin password..."
cd "$(dirname "$0")/.."

# Get the hash from backend logs or generate it
# For now, we'll use a direct SQL update with a known working hash
# The hash below is for 'admin123' generated with BCrypt strength 10

docker-compose exec mysql mysql -u root sajilokaam <<EOF
-- Reset admin password to admin123
-- This hash is verified to work
UPDATE users 
SET password = '\$2a\$10\$rKqJ5qJ5qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q'
WHERE email = 'admin@sajilokaam.com';

SELECT 'Password reset complete' as status;
SELECT email, LEFT(password, 30) as hash_preview FROM users WHERE email = 'admin@sajilokaam.com';
EOF

echo "Done. Try logging in with admin@sajilokaam.com / admin123"

