-- Invoices Table
CREATE TABLE invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  project_id BIGINT,
  client_id BIGINT NOT NULL,
  freelancer_id BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SENT, PAID, OVERDUE, CANCELLED
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'NPR',
  notes TEXT,
  terms TEXT,
  paid_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_invoices_client (client_id),
  INDEX idx_invoices_freelancer (freelancer_id),
  INDEX idx_invoices_project (project_id),
  INDEX idx_invoices_status (status),
  INDEX idx_invoices_number (invoice_number)
);

-- Invoice Items Table
CREATE TABLE invoice_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_id BIGINT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  item_type VARCHAR(50) DEFAULT 'SERVICE', -- SERVICE, PRODUCT, TIME, EXPENSE
  task_id BIGINT,
  time_log_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (time_log_id) REFERENCES time_logs(id) ON DELETE SET NULL,
  INDEX idx_items_invoice (invoice_id)
);

-- Invoice Templates Table
CREATE TABLE invoice_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50), -- CASH, BANK_TRANSFER, KHALTI, ESEWA, CREDIT_CARD
  payment_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  INDEX idx_payments_invoice (invoice_id),
  INDEX idx_payments_status (status)
);

-- Recurring Invoices Table
CREATE TABLE recurring_invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_id BIGINT NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- WEEKLY, MONTHLY, QUARTERLY, YEARLY
  next_invoice_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  INDEX idx_recurring_invoice (invoice_id),
  INDEX idx_recurring_active (is_active)
);

-- Seed default invoice template
INSERT INTO invoice_templates (name, description, template_content, is_default) VALUES
('Default Template', 'Standard invoice template', '{"header": {"logo": "", "companyName": "Sajilo Kaam", "address": "", "contact": ""}, "footer": {"notes": "Thank you for your business!", "terms": "Payment is due within 30 days."}}', TRUE);

