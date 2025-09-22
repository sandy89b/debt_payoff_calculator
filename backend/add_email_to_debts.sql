-- Add user_email column to debts table for easier identification
-- This will store the email directly in the debts table

-- Step 1: Add the user_email column
ALTER TABLE debts ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Step 2: Update existing debts with user emails from users table
UPDATE debts 
SET user_email = users.email 
FROM users 
WHERE debts.user_id = users.id;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_debts_user_email ON debts(user_email);

-- Step 4: Verify the update
SELECT 
    id, 
    user_id, 
    user_email, 
    name as debt_name, 
    balance, 
    is_active 
FROM debts 
ORDER BY user_email, id;
