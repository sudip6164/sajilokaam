-- Add a real job deadline (separate from expires_at which is for job posting expiry)
ALTER TABLE jobs
  ADD COLUMN deadline DATE NULL AFTER expires_at;

CREATE INDEX idx_jobs_deadline ON jobs(deadline);

