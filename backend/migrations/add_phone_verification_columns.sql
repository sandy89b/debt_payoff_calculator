-- Add phone verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP;

-- Add index for phone verification code lookup
CREATE INDEX IF NOT EXISTS idx_users_phone_verification_code ON users(phone_verification_code);

-- Add index for phone lookup
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
