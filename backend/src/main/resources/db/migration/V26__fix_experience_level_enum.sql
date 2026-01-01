-- Fix the experience_level enum value from MID_LEVEL to MID
UPDATE freelancer_profiles
SET experience_level = 'MID'
WHERE experience_level = 'MID_LEVEL';

