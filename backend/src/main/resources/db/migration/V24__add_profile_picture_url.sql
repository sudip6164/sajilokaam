-- Add profile_picture_url column to freelancer_profiles table
ALTER TABLE freelancer_profiles 
ADD COLUMN profile_picture_url VARCHAR(500) NULL;

