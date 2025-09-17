#!/usr/bin/env node

const fetch = require('node-fetch');

async function testGoogleOAuth() {
  console.log('🧪 Testing Google OAuth setup...\n');

  try {
    // Test getting Google OAuth URL
    console.log('1. Testing Google OAuth URL generation...');
    const response = await fetch('http://localhost:3001/api/auth/google/url');
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Google OAuth URL generated successfully');
      console.log('   Auth URL:', result.authUrl);
      console.log('\n📋 To test the complete flow:');
      console.log('1. Open the auth URL in your browser');
      console.log('2. Complete Google OAuth flow');
      console.log('3. You should be redirected back to the frontend');
    } else {
      console.log('❌ Failed to generate Google OAuth URL:', result.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend server is running (npm run dev)');
    console.log('2. Google OAuth credentials are configured');
    console.log('3. All dependencies are installed');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      testGoogleOAuth();
    } else {
      console.log('❌ Server is not responding. Make sure to start the backend server first.');
      console.log('Run: npm run dev');
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure the backend is running on port 3001.');
    console.log('Run: npm run dev');
  }
}

checkServer();
