-- Transactions Table (for all payment gateway transactions)
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id BIGINT,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL, -- KHALTI, ESEWA, BANK_TRANSFER, etc.
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NPR',
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED
  gateway_transaction_id VARCHAR(255),
  gateway_response TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_transactions_payment (payment_id),
  INDEX idx_transactions_gateway (gateway),
  INDEX idx_transactions_status (status),
  INDEX idx_transactions_txn_id (transaction_id)
);

-- Escrow Accounts Table
CREATE TABLE escrow_accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  client_id BIGINT NOT NULL,
  freelancer_id BIGINT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  released_amount DECIMAL(12,2) DEFAULT 0,
  refunded_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, REFUNDED, DISPUTED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_escrow_project (project_id),
  INDEX idx_escrow_status (status)
);

-- Escrow Releases Table
CREATE TABLE escrow_releases (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  escrow_account_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  release_type VARCHAR(50) NOT NULL, -- MILESTONE, COMPLETE, PARTIAL
  milestone_id BIGINT,
  released_by BIGINT NOT NULL, -- User who authorized the release
  transaction_id BIGINT,
  notes TEXT,
  released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (escrow_account_id) REFERENCES escrow_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
  FOREIGN KEY (released_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  INDEX idx_escrow_releases_account (escrow_account_id)
);

-- Payment Disputes Table
CREATE TABLE payment_disputes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id BIGINT NOT NULL,
  transaction_id BIGINT,
  raised_by BIGINT NOT NULL, -- User who raised the dispute
  dispute_type VARCHAR(50) NOT NULL, -- REFUND_REQUEST, PAYMENT_ISSUE, SERVICE_NOT_DELIVERED
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_REVIEW, RESOLVED, CLOSED
  resolution TEXT,
  resolved_by BIGINT, -- Admin who resolved
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_disputes_payment (payment_id),
  INDEX idx_disputes_status (status)
);

-- Add transaction fee fields to payments table
ALTER TABLE payments
  ADD COLUMN transaction_fee DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN net_amount DECIMAL(12,2),
  ADD COLUMN gateway VARCHAR(50),
  ADD COLUMN gateway_transaction_id VARCHAR(255),
  ADD INDEX idx_payments_gateway (gateway);

