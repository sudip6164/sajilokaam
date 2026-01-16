-- Subscription Plans
CREATE TABLE subscription_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2) NOT NULL,
  max_bids_per_month INT NOT NULL DEFAULT -1,
  max_job_posts_per_month INT NOT NULL DEFAULT -1,
  platform_fee_percent DECIMAL(5, 2) NOT NULL,
  featured_profile BOOLEAN NOT NULL DEFAULT FALSE,
  priority_support BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX idx_plans_active (active)
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  billing_period VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  INDEX idx_subscription_user (user_id),
  INDEX idx_subscription_active (is_active)
);

-- Seed default plans
INSERT INTO subscription_plans (name, display_name, description, monthly_price, yearly_price, max_bids_per_month, max_job_posts_per_month, platform_fee_percent, featured_profile, priority_support, active) VALUES
('FREE', 'Free', 'Perfect for getting started', 0.00, 0.00, 5, 3, 10.00, FALSE, FALSE, TRUE),
('PROFESSIONAL', 'Professional', 'For serious freelancers', 19.00, 190.00, -1, -1, 5.00, TRUE, TRUE, TRUE),
('ENTERPRISE', 'Enterprise', 'For teams and agencies', 0.00, 0.00, -1, -1, 0.00, TRUE, TRUE, TRUE);
