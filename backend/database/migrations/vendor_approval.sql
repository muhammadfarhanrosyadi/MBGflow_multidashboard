-- ============================================================
-- VENDOR APPROVAL SYSTEM — SQL MIGRATION
-- Run this script on your MySQL database to apply changes.
-- ============================================================

-- 1. Extend suppliers table with approval fields
ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by     BIGINT NULL,
  ADD COLUMN IF NOT EXISTS approved_at     DATETIME NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS approval_notes  TEXT NULL;

-- 2. Add foreign key constraint for approved_by -> users.id
ALTER TABLE suppliers
  ADD CONSTRAINT fk_suppliers_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Set existing suppliers to approved status (they pre-existed before the approval flow)
UPDATE suppliers SET approval_status = 'approved' WHERE approval_status = 'pending';

-- 4. Create vendor_approval_logs table
CREATE TABLE IF NOT EXISTS vendor_approval_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  supplier_id BIGINT UNSIGNED NOT NULL,
  action      VARCHAR(50)     NOT NULL COMMENT 'created|approved|rejected|updated|deleted',
  old_status  VARCHAR(20)     NULL,
  new_status  VARCHAR(20)     NULL,
  approved_by BIGINT          NULL COMMENT 'FK to users.id',
  notes       TEXT            NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_val_supplier (supplier_id),
  INDEX idx_val_action   (action),
  INDEX idx_val_created  (created_at),
  CONSTRAINT fk_val_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  CONSTRAINT fk_val_user
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
