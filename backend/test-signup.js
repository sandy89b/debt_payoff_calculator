#!/usr/bin/env node

const fetch = require('node-fetch');

async function testSignup() {
  console.log('🧪 Testing signup with the fixed validation...\n');

  const testData = {
    firstName: 'Jonas',
    lastName: 'Hermann',
    email: `test${Date.now()}@example.com`,
    password: 'king123123',
    confirmPassword: 'king123123'
  };

  try {
    console.log('Sending signup request with data:', testData);
    
    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      console.log('User created:', result.data.user.email);
    } else {
      console.log('❌ Signup failed:', result.message);
      if (result.errors) {
        console.log('Validation errors:', result.errors);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      testSignup();
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
