#!/usr/bin/env node

const { pool } = require('./config/database');

async function migrateDatabase() {
  console.log('🔄 Starting database migration...\n');

  try {
    // Check if users table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Users table does not exist. Please run the server first to create the table.');
      process.exit(1);
    }

    console.log('✅ Users table exists');

    // Add OAuth columns if they don't exist
    const addOAuthColumns = `
      DO $$ 
      BEGIN
        -- Add google_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_id') THEN
          ALTER TABLE users ADD COLUMN google_id VARCHAR(100) UNIQUE;
          RAISE NOTICE 'Added google_id column';
        ELSE
          RAISE NOTICE 'google_id column already exists';
        END IF;
        
        -- Add provider column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'provider') THEN
          ALTER TABLE users ADD COLUMN provider VARCHAR(20) DEFAULT 'local';
          RAISE NOTICE 'Added provider column';
        ELSE
          RAISE NOTICE 'provider column already exists';
        END IF;
        
        -- Add avatar_url column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
          ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
          RAISE NOTICE 'Added avatar_url column';
        ELSE
          RAISE NOTICE 'avatar_url column already exists';
        END IF;
        
        -- Add email_verified column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
          ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Added email_verified column';
        ELSE
          RAISE NOTICE 'email_verified column already exists';
        END IF;
        
        -- Make password_hash nullable if it's not already
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' AND is_nullable = 'NO') THEN
          ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
          RAISE NOTICE 'Made password_hash nullable';
        ELSE
          RAISE NOTICE 'password_hash is already nullable';
        END IF;
      END $$;
    `;

    await pool.query(addOAuthColumns);

    // Create indexes
    console.log('Creating indexes...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    console.log('✅ Email index created');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
    console.log('✅ Google ID index created');

    console.log('\n🎉 Database migration completed successfully!');
    console.log('\nYour users table now supports:');
    console.log('- Google OAuth authentication');
    console.log('- Optional password for OAuth users');
    console.log('- User avatars and email verification status');
    console.log('- Proper indexing for performance');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateDatabase();
