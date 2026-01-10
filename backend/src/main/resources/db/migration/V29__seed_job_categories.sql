-- Insert job categories
INSERT INTO job_categories (name, description, created_at) VALUES
('Web Development', 'Build websites, web applications, and backend systems', NOW()),
('Mobile Development', 'Create mobile apps for iOS, Android, and cross-platform', NOW()),
('Design & Creative', 'UI/UX design, graphic design, branding, and creative work', NOW()),
('Writing & Translation', 'Content writing, copywriting, technical writing, and translation', NOW()),
('Marketing & Sales', 'Digital marketing, social media, SEO, and sales', NOW()),
('Data Science', 'Data analysis, machine learning, and AI development', NOW()),
('DevOps & Cloud', 'Cloud infrastructure, CI/CD, and system administration', NOW()),
('Video & Animation', 'Video editing, motion graphics, and animation', NOW()),
('Business Consulting', 'Business strategy, project management, and consulting', NOW()),
('Customer Support', 'Customer service, technical support, and community management', NOW())
ON CONFLICT (name) DO NOTHING;
