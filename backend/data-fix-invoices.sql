-- Fix for old projects missing invoices
-- This script creates invoices for PENDING_PAYMENT projects that don't have invoices

-- First, let's see which projects need invoices
SELECT p.id AS project_id, p.title, p.budget, p.status, p.client_id, p.freelancer_id
FROM projects p
LEFT JOIN invoices i ON i.project_id = p.id
WHERE p.status = 'PENDING_PAYMENT'
  AND i.id IS NULL;

-- Create invoices for these projects
INSERT INTO invoices (
    invoice_number,
    project_id,
    client_id,
    freelancer_id,
    status,
    issue_date,
    due_date,
    subtotal,
    tax_rate,
    tax_amount,
    discount,
    total_amount,
    currency,
    notes,
    created_at,
    updated_at
)
SELECT
    CONCAT('INV-FIX-', p.id, '-', UNIX_TIMESTAMP()) AS invoice_number,
    p.id AS project_id,
    p.client_id,
    p.freelancer_id,
    'PENDING' AS status,
    CURDATE() AS issue_date,
    DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS due_date,
    p.budget AS subtotal,
    0 AS tax_rate,
    0 AS tax_amount,
    0 AS discount,
    p.budget AS total_amount,
    'NPR' AS currency,
    CONCAT('Payment for project: ', p.title, ' (Auto-generated for data fix)') AS notes,
    NOW() AS created_at,
    NOW() AS updated_at
FROM projects p
LEFT JOIN invoices i ON i.project_id = p.id
WHERE p.status = 'PENDING_PAYMENT'
  AND i.id IS NULL
  AND p.budget IS NOT NULL
  AND p.client_id IS NOT NULL
  AND p.freelancer_id IS NOT NULL;

-- Verify the fix
SELECT p.id AS project_id, p.title, i.id AS invoice_id, i.invoice_number, i.total_amount
FROM projects p
LEFT JOIN invoices i ON i.project_id = p.id
WHERE p.status = 'PENDING_PAYMENT';
