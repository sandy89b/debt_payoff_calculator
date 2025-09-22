const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'king123123',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a new pool instance
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table if it doesn't exist
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(100) UNIQUE,
        provider VARCHAR(20) DEFAULT 'local',
        avatar_url VARCHAR(500),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);

    // Add new columns to existing table if they don't exist
    const addOAuthColumns = `
      DO $$ 
      BEGIN
        -- Add google_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_id') THEN
          ALTER TABLE users ADD COLUMN google_id VARCHAR(100) UNIQUE;
        END IF;
        
        -- Add provider column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'provider') THEN
          ALTER TABLE users ADD COLUMN provider VARCHAR(20) DEFAULT 'local';
        END IF;
        
        -- Add avatar_url column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
          ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
        END IF;
        
        -- Add email_verified column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
          ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Make password_hash nullable if it's not already
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' AND is_nullable = 'NO') THEN
          ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
        END IF;
        
        -- Add phone column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
          ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        END IF;
        
        -- Add phone_verified column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
          ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add phone_verification_code column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verification_code') THEN
          ALTER TABLE users ADD COLUMN phone_verification_code VARCHAR(6);
        END IF;
        
        -- Add phone_verification_expires column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verification_expires') THEN
          ALTER TABLE users ADD COLUMN phone_verification_expires TIMESTAMP;
        END IF;
        
        -- Add role column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
        
        -- Add password reset columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_token') THEN
          ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_expires') THEN
          ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;
        END IF;
      END $$;
    `;

    await pool.query(addOAuthColumns);

    // Create indexes for faster lookups
    const createEmailIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    
    const createGoogleIdIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `;
    
    const createPhoneIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `;
    
    const createPhoneVerificationIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_phone_verification_code ON users(phone_verification_code);
    `;
    
    const createPasswordResetIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
    `;

    await pool.query(createEmailIndex);
    await pool.query(createGoogleIdIndex);
    await pool.query(createPhoneIndex);
    await pool.query(createPhoneVerificationIndex);
    await pool.query(createPasswordResetIndex);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Export pool and initialization function
module.exports = {
  pool,
  initializeDatabase
};
