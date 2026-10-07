-- ============================================
-- Migration 009
-- Database triggers and additional constraints
-- ============================================


-- ============================================
-- 1. Unique checklist type name
-- ============================================

ALTER TABLE checklist_types
ADD CONSTRAINT checklist_types_name_unique
UNIQUE (name);


-- ============================================
-- 2. Add sort order to checklist options
-- ============================================

ALTER TABLE checklist_options
ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE checklist_options
ADD CONSTRAINT checklist_options_sort_order_check
CHECK (sort_order >= 0);


-- ============================================
-- 3. Create updated_at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================
-- 4. Users updated_at trigger
-- ============================================

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 5. User addresses updated_at trigger
-- ============================================

CREATE TRIGGER user_addresses_updated_at_trigger
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 6. Checklist types updated_at trigger
-- ============================================

CREATE TRIGGER checklist_types_updated_at_trigger
BEFORE UPDATE ON checklist_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 7. Checklist options updated_at trigger
-- ============================================

CREATE TRIGGER checklist_options_updated_at_trigger
BEFORE UPDATE ON checklist_options
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 8. Checklists updated_at trigger
-- ============================================

CREATE TRIGGER checklists_updated_at_trigger
BEFORE UPDATE ON checklists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();