-- Seed common job skills
-- Note: Using INSERT IGNORE to avoid conflicts on re-run

-- Technology & Programming Skills
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('JavaScript', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('TypeScript', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('React', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Vue.js', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Angular', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Node.js', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Express.js', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Next.js', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('HTML', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('CSS', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Tailwind CSS', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW()),
('Bootstrap', (SELECT id FROM job_categories WHERE name = 'Web Development'), NOW());

-- Mobile Development
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('React Native', (SELECT id FROM job_categories WHERE name = 'Mobile Development'), NOW()),
('Flutter', (SELECT id FROM job_categories WHERE name = 'Mobile Development'), NOW()),
('iOS Development', (SELECT id FROM job_categories WHERE name = 'Mobile Development'), NOW()),
('Android Development', (SELECT id FROM job_categories WHERE name = 'Mobile Development'), NOW()),
('Swift', (SELECT id FROM job_categories WHERE name = 'Mobile Development'), NOW()),
('Kotlin', (SELECT id FROM job_categories WHERE name = 'Mobile Development'), NOW());

-- Backend & Database
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('Python', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Django', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Flask', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Java', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Spring Boot', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('PHP', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Laravel', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Ruby on Rails', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('MySQL', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('PostgreSQL', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('MongoDB', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW()),
('Redis', (SELECT id FROM job_categories WHERE name = 'Backend Development'), NOW());

-- Design
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('UI Design', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('UX Design', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('Figma', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('Adobe Photoshop', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('Adobe Illustrator', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('Graphic Design', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('Logo Design', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW()),
('Branding', (SELECT id FROM job_categories WHERE name = 'Design & Creative'), NOW());

-- Marketing
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('Digital Marketing', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW()),
('SEO', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW()),
('Social Media Marketing', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW()),
('Content Marketing', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW()),
('Email Marketing', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW()),
('Facebook Ads', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW()),
('Google Ads', (SELECT id FROM job_categories WHERE name = 'Marketing & Sales'), NOW());

-- Writing & Content
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('Content Writing', (SELECT id FROM job_categories WHERE name = 'Writing & Content'), NOW()),
('Copywriting', (SELECT id FROM job_categories WHERE name = 'Writing & Content'), NOW()),
('Technical Writing', (SELECT id FROM job_categories WHERE name = 'Writing & Content'), NOW()),
('Blog Writing', (SELECT id FROM job_categories WHERE name = 'Writing & Content'), NOW()),
('Proofreading', (SELECT id FROM job_categories WHERE name = 'Writing & Content'), NOW()),
('Editing', (SELECT id FROM job_categories WHERE name = 'Writing & Content'), NOW());

-- Data Science
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('Machine Learning', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW()),
('Data Analysis', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW()),
('TensorFlow', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW()),
('PyTorch', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW()),
('Pandas', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW()),
('NumPy', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW()),
('Data Visualization', (SELECT id FROM job_categories WHERE name = 'Data Science & Analytics'), NOW());

-- General Skills (for Others category)
INSERT IGNORE INTO job_skills (name, category_id, created_at) VALUES
('Project Management', (SELECT id FROM job_categories WHERE name = 'Others'), NOW()),
('Excel', (SELECT id FROM job_categories WHERE name = 'Others'), NOW()),
('PowerPoint', (SELECT id FROM job_categories WHERE name = 'Others'), NOW()),
('Customer Service', (SELECT id FROM job_categories WHERE name = 'Others'), NOW()),
('Data Entry', (SELECT id FROM job_categories WHERE name = 'Others'), NOW());
