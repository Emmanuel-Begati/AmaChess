const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001';

async function testLichessAPI() {
  console.log('🧪 Testing Lichess API Integration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy');
    console.log('Features:', healthResponse.data.features);
    console.log('');

    // Test 2: Check Lichess API status
    console.log('2. Testing Lichess API status...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/games/status`);
      console.log('✅ Lichess API status:', statusResponse.data);
    } catch (error) {
      console.log('❌ Lichess API status check failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Fetch PGN games for a test user
    console.log('3. Testing PGN game fetching...');
    const testUsername = 'DrNykterstein'; // Magnus Carlsen's Lichess account
    
    try {
      console.log(`Fetching games for user: ${testUsername}`);
      const pgnResponse = await axios.get(`${BASE_URL}/api/games/${testUsername}`, {
        params: {
          max: 5,
          rated: 'true'
        }
      });
      
      console.log('✅ PGN fetch successful');
      console.log('Response headers:');
      console.log('- Content-Type:', pgnResponse.headers['content-type']);
      console.log('- Game Count:', pgnResponse.headers['x-game-count']);
      console.log('- User:', pgnResponse.headers['x-user']);
      console.log('');
      console.log('PGN Preview (first 500 characters):');
      console.log(pgnResponse.data.substring(0, 500) + '...');
      
    } catch (error) {
      console.log('❌ PGN fetch failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Fetch games in JSON format
    console.log('4. Testing JSON format...');
    try {
      const jsonResponse = await axios.get(`${BASE_URL}/api/games/${testUsername}/json`, {
        params: {
          max: 3
        }
      });
      
      console.log('✅ JSON fetch successful');
      console.log('Game count:', jsonResponse.data.gameCount);
      console.log('Username:', jsonResponse.data.username);
      console.log('Fetched at:', jsonResponse.data.fetchedAt);
      
    } catch (error) {
      console.log('❌ JSON fetch failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Test error handling with invalid username
    console.log('5. Testing error handling...');
    try {
      await axios.get(`${BASE_URL}/api/games/nonexistentuser123456789`);
      console.log('❌ Should have failed for non-existent user');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly handled non-existent user');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 6: Test cache functionality
    console.log('6. Testing cache functionality...');
    try {
      const cacheResponse = await axios.get(`${BASE_URL}/api/games/${testUsername}/cache`);
      console.log('✅ Cache check successful');
      console.log('Cached files:', cacheResponse.data.totalFiles);
      
    } catch (error) {
      console.log('❌ Cache check failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Lichess API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3001');
      console.log('Run: npm run dev or npm start in the backend directory');
    }
  }
}

// Environment check
console.log('🔍 Environment Check:');
console.log('- PORT:', process.env.PORT || '3001 (default)');
console.log('- LICHESS_API_TOKEN:', process.env.LICHESS_API_TOKEN ? '✅ Set' : '❌ Not set');
console.log('');

if (!process.env.LICHESS_API_TOKEN) {
  console.log('⚠️  WARNING: LICHESS_API_TOKEN is not set in .env file');
  console.log('Get your token from: https://lichess.org/account/oauth/token');
  console.log('');
}

testLichessAPI();
