-- Freelancer profile table capturing full onboarding details
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    headline VARCHAR(255),
    overview TEXT,
    hourly_rate DECIMAL(12,2),
    hourly_rate_min DECIMAL(12,2),
    hourly_rate_max DECIMAL(12,2),
    availability VARCHAR(50),
    experience_level VARCHAR(50),
    experience_years INT,
    location_country VARCHAR(120),
    location_city VARCHAR(120),
    timezone VARCHAR(120),
    primary_skills TEXT,
    secondary_skills TEXT,
    languages TEXT,
    education TEXT,
    certifications TEXT,
    portfolio_url VARCHAR(255),
    website_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    video_intro_url VARCHAR(255),
    preferred_workload VARCHAR(50),
    team_role VARCHAR(50),
    team_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    verification_notes TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_freelancer_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_freelancer_profile_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_freelancer_profile_status (status),
    INDEX idx_freelancer_profile_reviewed_by (reviewed_by)
);

-- Client profile table for company/hiring data
CREATE TABLE IF NOT EXISTS client_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(255),
    company_website VARCHAR(255),
    company_size VARCHAR(50),
    industry VARCHAR(120),
    description TEXT,
    location_country VARCHAR(120),
    location_city VARCHAR(120),
    timezone VARCHAR(120),
    hiring_needs TEXT,
    average_budget_min DECIMAL(12,2),
    average_budget_max DECIMAL(12,2),
    preferred_contract_type VARCHAR(50),
    languages TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    verification_notes TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_client_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_profile_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_client_profile_status (status),
    INDEX idx_client_profile_reviewed_by (reviewed_by)
);

-- Optional supporting documents linked to a profile verification
CREATE TABLE IF NOT EXISTS profile_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    profile_type VARCHAR(30) NOT NULL,
    document_type VARCHAR(120),
    file_name VARCHAR(255),
    file_url VARCHAR(512),
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profile_documents_user (user_id),
    INDEX idx_profile_documents_type (profile_type)
);

-- Collaboration tables for freelancer teams (team lead + members)
CREATE TABLE IF NOT EXISTS freelancer_teams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_freelancer_team_lead (lead_user_id)
);

CREATE TABLE IF NOT EXISTS freelancer_team_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    team_role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES freelancer_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_team_member (team_id, user_id),
    INDEX idx_team_member_role (team_role)
);

-- Seed baseline profile rows for existing users so onboarding screens have data to work with
INSERT INTO freelancer_profiles (user_id, status)
SELECT DISTINCT ur.user_id, 'DRAFT'
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
LEFT JOIN freelancer_profiles fp ON fp.user_id = ur.user_id
WHERE r.name = 'FREELANCER' AND fp.user_id IS NULL;

INSERT INTO client_profiles (user_id, status)
SELECT DISTINCT ur.user_id, 'DRAFT'
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
LEFT JOIN client_profiles cp ON cp.user_id = ur.user_id
WHERE r.name = 'CLIENT' AND cp.user_id IS NULL;

