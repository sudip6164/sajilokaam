-- Add Upwork-style bidding features

-- Add connects system to freelancer profiles
ALTER TABLE freelancer_profiles
ADD COLUMN connects_available INT DEFAULT 0 COMMENT 'Available connects for bidding (like Upwork credits)',
ADD COLUMN connects_total_purchased INT DEFAULT 0 COMMENT 'Total connects ever purchased',
ADD COLUMN profile_strength ENUM('INCOMPLETE', 'BASIC', 'INTERMEDIATE', 'STRONG', 'EXPERT') DEFAULT 'BASIC' COMMENT 'Profile completeness indicator';

-- Add bid statistics to freelancer profiles
ALTER TABLE freelancer_profiles
ADD COLUMN total_bids_submitted INT DEFAULT 0 COMMENT 'Total number of bids submitted',
ADD COLUMN total_bids_won INT DEFAULT 0 COMMENT 'Total number of accepted bids',
ADD COLUMN success_rate DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Bid win rate percentage',
ADD COLUMN avg_response_time_hours INT DEFAULT NULL COMMENT 'Average response time to messages',
ADD COLUMN total_earnings DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Total earnings from completed projects',
ADD COLUMN on_time_delivery_rate DECIMAL(5, 2) DEFAULT 100.00 COMMENT 'Percentage of projects delivered on time';

-- Add enhanced fields to bids table
ALTER TABLE bids
ADD COLUMN connects_used INT DEFAULT 2 COMMENT 'Connects spent on this bid (default 2 like Upwork)',
ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE COMMENT 'Whether bid is boosted/featured',
ADD COLUMN boost_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Amount paid to boost bid',
ADD COLUMN available_start_date DATE DEFAULT NULL COMMENT 'When freelancer can start',
ADD COLUMN estimated_duration VARCHAR(100) DEFAULT NULL COMMENT 'Estimated project duration',
ADD COLUMN cover_letter_template_id BIGINT DEFAULT NULL COMMENT 'Reference to saved template used',
ADD COLUMN screening_answers TEXT DEFAULT NULL COMMENT 'JSON array of answers to screening questions',
ADD COLUMN shortlisted BOOLEAN DEFAULT FALSE COMMENT 'Marked as shortlisted by client',
ADD COLUMN viewed_by_client BOOLEAN DEFAULT FALSE COMMENT 'Whether client has viewed this bid',
ADD COLUMN viewed_at TIMESTAMP DEFAULT NULL COMMENT 'When client first viewed the bid';

-- Add screening questions to jobs table
ALTER TABLE jobs
ADD COLUMN screening_questions TEXT DEFAULT NULL COMMENT 'JSON array of screening questions for bidders',
ADD COLUMN requires_portfolio BOOLEAN DEFAULT FALSE COMMENT 'Whether portfolio samples are required',
ADD COLUMN bid_visibility ENUM('PUBLIC', 'PRIVATE', 'HIDDEN_COUNT') DEFAULT 'HIDDEN_COUNT' COMMENT 'How bid count is shown to freelancers',
ADD COLUMN max_bids INT DEFAULT NULL COMMENT 'Maximum number of bids allowed (NULL = unlimited)',
ADD COLUMN bid_deadline TIMESTAMP DEFAULT NULL COMMENT 'Deadline for submitting bids';

-- Create cover letter templates table
CREATE TABLE IF NOT EXISTS cover_letter_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT NULL COMMENT 'Template category (e.g., Web Dev, Design)',
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Default template to use',
    times_used INT DEFAULT 0 COMMENT 'How many times this template has been used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cover_letter_templates_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create connects purchase history table
CREATE TABLE IF NOT EXISTS connects_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount INT NOT NULL COMMENT 'Number of connects',
    type ENUM('PURCHASE', 'REFUND', 'SPENT', 'BONUS') NOT NULL,
    reference_id BIGINT DEFAULT NULL COMMENT 'Reference to bid, purchase, etc.',
    reference_type VARCHAR(50) DEFAULT NULL COMMENT 'Type of reference (bid, purchase)',
    description VARCHAR(255) DEFAULT NULL,
    balance_after INT NOT NULL COMMENT 'Connects balance after this transaction',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_connects_transactions_user (user_id),
    INDEX idx_connects_transactions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Give existing freelancers 10 free connects to start
UPDATE freelancer_profiles 
SET connects_available = 10, 
    connects_total_purchased = 10
WHERE status != 'DRAFT';

-- Insert initial connect transaction for existing freelancers
INSERT INTO connects_transactions (user_id, amount, type, description, balance_after)
SELECT 
    fp.user_id,
    10,
    'BONUS',
    'Initial free connects',
    10
FROM freelancer_profiles fp
WHERE fp.status != 'DRAFT'
  AND NOT EXISTS (
      SELECT 1 FROM connects_transactions ct WHERE ct.user_id = fp.user_id
  );
