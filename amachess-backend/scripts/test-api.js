const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing AmaChess Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Stockfish Analysis
    console.log('\n2️⃣ Testing Stockfish analysis...');
    const analysisResponse = await axios.post(`${BASE_URL}/stockfish/analyze`, {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      depth: 10,
      time: 1000
    });
    console.log('✅ Analysis passed:', {
      bestMove: analysisResponse.data.analysis.bestMove,
      evaluation: analysisResponse.data.analysis.evaluation
    });

    // Test 3: AI Coach Move
    console.log('\n3️⃣ Testing AI coach move...');
    const coachResponse = await axios.post(`${BASE_URL}/stockfish/coach/move`, {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      skillLevel: 15,
      depth: 10
    });
    console.log('✅ Coach move passed:', {
      move: coachResponse.data.coaching.suggestedMove,
      explanation: coachResponse.data.coaching.explanation
    });

    // Test 4: Hint Generation
    console.log('\n4️⃣ Testing hint generation...');
    const hintResponse = await axios.post(`${BASE_URL}/stockfish/coach/hint`, {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      difficulty: 'medium'
    });
    console.log('✅ Hint generation passed:', {
      hint: hintResponse.data.hint.message,
      level: hintResponse.data.hint.level
    });

    // Test 5: Move Evaluation
    console.log('\n5️⃣ Testing move evaluation...');
    const evalResponse = await axios.post(`${BASE_URL}/stockfish/coach/evaluate`, {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      playerMove: 'e2e4',
      depth: 10
    });
    console.log('✅ Move evaluation passed:', {
      playerMove: evalResponse.data.evaluation.playerMove,
      quality: evalResponse.data.evaluation.quality,
      feedback: evalResponse.data.evaluation.feedback
    });

    console.log('\n🎉 All API tests passed successfully!');
    console.log('🚀 Your AmaChess Backend is fully operational!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('\n🔧 Make sure the server is running: npm run dev');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
