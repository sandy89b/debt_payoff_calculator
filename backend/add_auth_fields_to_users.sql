-- Add additional authentication fields to users table

-- Add phone verification status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Add password reset fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(6);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Add verification code expiry for phone verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_phone_verification ON users(phone_verification_code);

-- Add comments
COMMENT ON COLUMN users.phone_verified IS 'Whether the phone number has been verified via SMS';
COMMENT ON COLUMN users.password_reset_token IS '6-digit code for password reset';
COMMENT ON COLUMN users.password_reset_expires IS 'Expiry time for password reset token';
COMMENT ON COLUMN users.phone_verification_code IS '6-digit code for phone verification';
COMMENT ON COLUMN users.phone_verification_expires IS 'Expiry time for phone verification code';

-- Show updated table structure
\d users;





