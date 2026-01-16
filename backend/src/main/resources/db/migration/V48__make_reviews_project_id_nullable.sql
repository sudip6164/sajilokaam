-- Make project_id nullable in reviews table to allow reviews without projects
ALTER TABLE reviews 
  MODIFY COLUMN project_id BIGINT NULL,
  DROP INDEX unique_project_reviewer,
  ADD UNIQUE KEY unique_project_reviewer (project_id, reviewer_id, reviewee_id);
