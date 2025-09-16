#!/usr/bin/env node

const { initializeDatabase } = require('./config/database');

console.log('🚀 Setting up Debt Freedom Builder Bible Backend...\n');

async function setup() {
  try {
    console.log('📊 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database setup completed successfully!\n');
    
    console.log('🎉 Backend setup completed!');
    console.log('\nNext steps:');
    console.log('1. Make sure your PostgreSQL server is running');
    console.log('2. Update config.env with your database credentials');
    console.log('3. Run: npm install');
    console.log('4. Run: npm run dev');
    console.log('\nYour API will be available at: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your database credentials in config.env');
    console.log('3. Ensure the database exists');
    process.exit(1);
  }
}

setup();
