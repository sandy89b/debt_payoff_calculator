// Quick auth fix - generates a JWT token for immediate testing
const jwt = require('jsonwebtoken');
const { pool } = require('./config/database');

async function generateTokenForUser() {
  try {
    // Get the first user from database
    const result = await pool.query('SELECT id, email FROM users LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const user = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('✅ Generated JWT token for user:', user.email);
    console.log('🔑 Copy this token and paste it in your browser console:');
    console.log('');
    console.log(`localStorage.setItem('auth_token', '${token}');`);
    console.log(`localStorage.setItem('auth_status', 'authenticated');`);
    console.log(`localStorage.setItem('user_data', '${JSON.stringify(user)}');`);
    console.log('');
    console.log('Then refresh the page and try saving your debt again!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

generateTokenForUser();
