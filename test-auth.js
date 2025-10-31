const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('Testing authentication and game saving...');
    
    // 1. Check health
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log('Health check:', health.status);
    
    // 2. Create test user
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };
    
    console.log('Registering test user...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerResult = await registerResponse.json();
    if (registerResult.success) {
      console.log('✅ User registered successfully');
      const token = registerResult.data.token;
      
      // 3. Test game saving
      const gameData = {
        gameType: 'training',
        pgn: '[Event "Test"] 1. e4 e5 *',
        playerColor: 'white',
        result: '*',
        source: 'ai_coach'
      };
      
      console.log('Testing game save...');
      const saveResponse = await fetch(`${API_BASE_URL}/user-games/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gameData)
      });
      
      const saveResult = await saveResponse.json();
      if (saveResult.success) {
        console.log('✅ Game saved successfully!');
      } else {
        console.log('❌ Game save failed:', saveResult);
      }
      
    } else {
      console.log('❌ User registration failed:', registerResult);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();
