-- Two-Factor fields for users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(64),
  ADD COLUMN IF NOT EXISTS two_factor_temp_secret VARCHAR(64);


