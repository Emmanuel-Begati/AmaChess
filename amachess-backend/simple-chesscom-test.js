const axios = require('axios');

async function testChesscomAPI() {
  try {
    console.log('Testing basic Chess.com API endpoint...');
    
    const testUsername = 'magnuscarlsen';
    const url = `https://api.chess.com/pub/player/${testUsername}`;
    
    console.log(`Making request to: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AmaChess-Backend/1.0.0'
      }
    });
    
    console.log('✅ API Response received!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testChesscomAPI();
