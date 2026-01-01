-- Add sample profile data for dummy freelancers
-- This ensures they have complete profiles with data for testing

UPDATE freelancer_profiles fp
INNER JOIN users u ON fp.user_id = u.id
SET 
    fp.headline = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 'Full-Stack Developer | React & Node.js Expert'
        WHEN u.email = 'freelancer2@example.com' THEN 'Mobile App Developer | React Native Specialist'
        ELSE fp.headline
    END,
    fp.overview = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 'Experienced full-stack developer with 5+ years of expertise in building modern web applications. Specialized in React, Node.js, and database design. I have successfully delivered 20+ projects for clients worldwide.'
        WHEN u.email = 'freelancer2@example.com' THEN 'Mobile app developer specializing in React Native. I have built 10+ mobile applications for iOS and Android platforms. Passionate about creating user-friendly and performant mobile experiences.'
        ELSE fp.overview
    END,
    fp.hourly_rate = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 2500.00
        WHEN u.email = 'freelancer2@example.com' THEN 3000.00
        ELSE fp.hourly_rate
    END,
    fp.hourly_rate_min = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 2000.00
        WHEN u.email = 'freelancer2@example.com' THEN 2500.00
        ELSE fp.hourly_rate_min
    END,
    fp.hourly_rate_max = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 3500.00
        WHEN u.email = 'freelancer2@example.com' THEN 4000.00
        ELSE fp.hourly_rate_max
    END,
    fp.location_country = 'Nepal',
    fp.location_city = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 'Kathmandu'
        WHEN u.email = 'freelancer2@example.com' THEN 'Pokhara'
        ELSE fp.location_city
    END,
    fp.primary_skills = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN '["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL"]'
        WHEN u.email = 'freelancer2@example.com' THEN '["React Native", "JavaScript", "iOS", "Android", "Firebase"]'
        ELSE fp.primary_skills
    END,
    fp.secondary_skills = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN '["Express.js", "REST APIs", "GraphQL", "Docker", "AWS"]'
        WHEN u.email = 'freelancer2@example.com' THEN '["Redux", "TypeScript", "App Store", "Play Store", "Push Notifications"]'
        ELSE fp.secondary_skills
    END,
    fp.experience_years = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 5
        WHEN u.email = 'freelancer2@example.com' THEN 4
        ELSE fp.experience_years
    END,
    fp.availability = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 'FULL_TIME'
        WHEN u.email = 'freelancer2@example.com' THEN 'PART_TIME'
        ELSE fp.availability
    END,
    fp.experience_level = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 'MID'
        WHEN u.email = 'freelancer2@example.com' THEN 'SENIOR'
        ELSE fp.experience_level
    END,
    fp.languages = 'English, Nepali',
    fp.education = CASE 
        WHEN u.email = 'freelancer1@example.com' THEN 'Bachelor of Science in Computer Science, Tribhuvan University'
        WHEN u.email = 'freelancer2@example.com' THEN 'Bachelor of Engineering in Software Engineering, Pokhara University'
        ELSE fp.education
    END,
    fp.status = 'APPROVED'
WHERE u.email IN ('freelancer1@example.com', 'freelancer2@example.com');

