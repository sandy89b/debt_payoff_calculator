-- Enhance debt tracking with status, notifications, and SMS preferences
-- Add new columns to existing tables

-- Add debt status tracking (instead of just is_active boolean)
ALTER TABLE debts ADD COLUMN IF NOT EXISTS debt_status VARCHAR(20) DEFAULT 'active' CHECK (debt_status IN ('active', 'paid_off', 'archived'));

-- Add notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false}';
-- phone_number is deprecated; use users.phone instead. Keep here for backward compatibility in older DBs.

-- Add automatic detection fields to debts table
ALTER TABLE debts ADD COLUMN IF NOT EXISTS balance_reached_zero_at TIMESTAMP;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS auto_detected_payoff BOOLEAN DEFAULT false;

-- Create debt_balance_history table to track balance changes
CREATE TABLE IF NOT EXISTS debt_balance_history (
    id SERIAL PRIMARY KEY,
    debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    previous_balance DECIMAL(12,2),
    new_balance DECIMAL(12,2),
    payment_amount DECIMAL(12,2),
    change_type VARCHAR(20) CHECK (change_type IN ('payment', 'interest', 'fee', 'adjustment')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create debt_payoff_notifications table
CREATE TABLE IF NOT EXISTS debt_payoff_notifications (
    id SERIAL PRIMARY KEY,
    debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) CHECK (notification_type IN ('email', 'sms', 'both')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    message_content TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update existing paid-off debts to have proper status
UPDATE debts SET debt_status = 'paid_off' WHERE is_active = false AND paid_off_date IS NOT NULL;
