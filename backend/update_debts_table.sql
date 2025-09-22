-- Update debts table to support enhanced debt entry fields
-- This adds missing fields for the enhanced debt input system

-- Add description field for additional debt notes
ALTER TABLE debts ADD COLUMN IF NOT EXISTS description TEXT;

-- Add original_balance field for tracking progress
ALTER TABLE debts ADD COLUMN IF NOT EXISTS original_balance DECIMAL(12,2);

-- Update debt_type to support more categories
ALTER TABLE debts ALTER COLUMN debt_type SET DEFAULT 'other';

-- Add constraint to ensure debt_type is valid
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_debt_type_check;
ALTER TABLE debts ADD CONSTRAINT debts_debt_type_check 
CHECK (debt_type IN ('credit_card', 'student_loan', 'auto_loan', 'mortgage', 'personal_loan', 'medical_debt', 'business_loan', 'other'));

-- Update existing debts to have original_balance if not set
UPDATE debts 
SET original_balance = balance 
WHERE original_balance IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debts_user_active ON debts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_debts_debt_type ON debts(debt_type);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);

-- Add function to automatically set original_balance on insert
CREATE OR REPLACE FUNCTION set_original_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.original_balance IS NULL THEN
        NEW.original_balance = NEW.balance;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set original_balance
DROP TRIGGER IF EXISTS trigger_set_original_balance ON debts;
CREATE TRIGGER trigger_set_original_balance
    BEFORE INSERT ON debts
    FOR EACH ROW
    EXECUTE FUNCTION set_original_balance();
