-- Add profile_picture_url to client_profiles
ALTER TABLE client_profiles 
ADD COLUMN profile_picture_url VARCHAR(512);
