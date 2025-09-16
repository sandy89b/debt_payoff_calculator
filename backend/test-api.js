#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Debt Freedom Builder Bible API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test signup endpoint
    console.log('\n2. Testing signup endpoint...');
    const signupData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123',
      confirmPassword: 'TestPass123'
    };

    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    const signupResult = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('✅ Signup successful:', signupResult.message);
      console.log('   User created:', signupResult.data.user.email);
    } else {
      console.log('❌ Signup failed:', signupResult.message);
    }

    // Test signin endpoint
    console.log('\n3. Testing signin endpoint...');
    const signinResponse = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: signupData.email,
        password: signupData.password
      }),
    });

    const signinResult = await signinResponse.json();
    
    if (signinResponse.ok) {
      console.log('✅ Signin successful:', signinResult.message);
      console.log('   User signed in:', signinResult.data.user.email);
    } else {
      console.log('❌ Signin failed:', signinResult.message);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend server is running (npm run dev)');
    console.log('2. Database is connected');
    console.log('3. All dependencies are installed');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      testAPI();
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
