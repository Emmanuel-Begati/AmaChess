const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001';

// Sample PGN for testing
const SAMPLE_PGN = `[Event "Rated Blitz game"]
[Site "https://lichess.org/abcd1234"]
[Date "2024.01.15"]
[Round "-"]
[White "TestPlayer"]
[Black "Opponent"]
[Result "1-0"]
[UTCDate "2024.01.15"]
[UTCTime "10:30:00"]
[WhiteElo "1500"]
[BlackElo "1480"]
[WhiteRatingDiff "+12"]
[BlackRatingDiff "-12"]
[Variant "Standard"]
[TimeControl "300+3"]
[ECO "B20"]
[Opening "Sicilian Defense"]
[Termination "Normal"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. f3 b5 8. Qd2 Bb7 9. O-O-O Nbd7 10. h4 h6 11. g4 Ne5 12. f4 Nec4 13. Bxc4 Nxc4 14. Qe2 Nxe3 15. Qxe3 Rc8 16. g5 hxg5 17. hxg5 Nh5 18. Rxh5 Rxh5 19. g6 f6 20. Rh1 Rxh1+ 21. Nxh1 Qc7 22. Nf2 Be7 23. Kb1 Kf8 24. Nh3 Kg8 25. Nf4 Kh8 26. Qh3+ Kg8 27. Qh7+ Kf8 28. Qh8+ Ke8 29. Qxg7 Rf8 30. Qxe7+ Qxe7 31. Ncd5 1-0`;

const SIMPLE_PGN = `[Event "Test Game"]
[Site "Test"]
[Date "2024.01.15"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1-0`;

async function testPGNAnalysis() {
  console.log('🧪 Testing PGN Analysis API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy');
    console.log('Features:', healthResponse.data.features);
    console.log('');

    // Test 2: Test basic PGN analysis
    console.log('2. Testing basic PGN analysis...');
    try {
      const analysisResponse = await axios.post(`${BASE_URL}/api/analyze`, {
        pgn: SIMPLE_PGN,
        depth: 10,
        timePerMove: 1000,
        username: 'Player1'
      });

      console.log('✅ PGN analysis successful');
      const analysis = analysisResponse.data.analysis;
      
      console.log('Analysis Results:');
      console.log(`- Accuracy: ${analysis.accuracy}%`);
      console.log(`- Blunders: ${analysis.blunders}`);
      console.log(`- Mistakes: ${analysis.mistakes}`);
      console.log(`- Inaccuracies: ${analysis.inaccuracies}`);
      console.log(`- Total Moves: ${analysis.totalMoves}`);
      console.log(`- Player Side: ${analysis.playerSide}`);
      console.log(`- Opening: ${analysis.openingName}`);
      console.log(`- Analysis Time: ${analysis.analysisInfo.analysisTime}ms`);
      console.log('');

    } catch (error) {
      console.log('❌ Basic PGN analysis failed:', error.response?.data || error.message);
    }

    // Test 3: Test with more complex PGN
    console.log('3. Testing complex PGN analysis...');
    try {
      const complexAnalysisResponse = await axios.post(`${BASE_URL}/api/analyze`, {
        pgn: SAMPLE_PGN,
        depth: 12,
        timePerMove: 1500,
        username: 'TestPlayer'
      });

      console.log('✅ Complex PGN analysis successful');
      const analysis = complexAnalysisResponse.data.analysis;
      
      console.log('Complex Analysis Results:');
      console.log(`- Accuracy: ${analysis.accuracy}%`);
      console.log(`- Centipawn Loss: ${analysis.centipawnLoss}`);
      console.log(`- Key Moments: ${analysis.keyMoments.length}`);
      console.log(`- Performance Rating: ${analysis.performanceRating}`);
      
      if (analysis.keyMoments.length > 0) {
        console.log('First Key Moment:', analysis.keyMoments[0]);
      }
      
      console.log('Phase Analysis:');
      console.log(`- Opening Accuracy: ${analysis.phaseAnalysis.opening.accuracy}%`);
      console.log(`- Middlegame Accuracy: ${analysis.phaseAnalysis.middlegame.accuracy}%`);
      console.log(`- Endgame Accuracy: ${analysis.phaseAnalysis.endgame.accuracy}%`);
      console.log('');

    } catch (error) {
      console.log('❌ Complex PGN analysis failed:', error.response?.data || error.message);
    }

    // Test 4: Test error handling
    console.log('4. Testing error handling...');
    try {
      await axios.post(`${BASE_URL}/api/analyze`, {
        pgn: 'invalid pgn data',
        depth: 10,
        timePerMove: 1000
      });
      console.log('❌ Should have failed with invalid PGN');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly handled invalid PGN');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 5: Test cache functionality
    console.log('5. Testing cache functionality...');
    try {
      const cacheStatsResponse = await axios.get(`${BASE_URL}/api/analyze/cache/stats`);
      console.log('✅ Cache stats retrieved');
      console.log('Cache Stats:', cacheStatsResponse.data.cache);
      
      // Clear cache
      const clearCacheResponse = await axios.delete(`${BASE_URL}/api/analyze/cache`);
      console.log('✅ Cache cleared successfully');
      
    } catch (error) {
      console.log('❌ Cache functionality failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 6: Test batch analysis (if supported)
    console.log('6. Testing batch analysis...');
    try {
      const batchResponse = await axios.post(`${BASE_URL}/api/analyze/batch`, {
        pgns: [SIMPLE_PGN, SIMPLE_PGN.replace('Player1', 'Player3')],
        depth: 8,
        timePerMove: 1000,
        username: 'Player1'
      });

      console.log('✅ Batch analysis successful');
      const batchResults = batchResponse.data.batchAnalysis;
      console.log(`- Total Games: ${batchResults.totalGames}`);
      console.log(`- Successful: ${batchResults.successfulAnalyses}`);
      console.log(`- Failed: ${batchResults.failedAnalyses}`);
      console.log(`- Total Time: ${batchResults.totalTime}ms`);
      
    } catch (error) {
      console.log('❌ Batch analysis failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 PGN Analysis testing completed!');

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
console.log('- Backend URL:', BASE_URL);
console.log('- Node.js version:', process.version);
console.log('');

// Test with sample PGN integration
async function testIntegrationWithLichess() {
  console.log('🔗 Testing Integration with Lichess API...\n');
  
  try {
    // First fetch a PGN from Lichess
    console.log('1. Fetching PGN from Lichess...');
    const lichessResponse = await axios.get(`${BASE_URL}/api/games/DrNykterstein`, {
      params: { max: 1, rated: 'true' }
    });
    
    if (lichessResponse.data) {
      console.log('✅ PGN fetched from Lichess');
      
      // Now analyze the fetched PGN
      console.log('2. Analyzing fetched PGN...');
      const analysisResponse = await axios.post(`${BASE_URL}/api/analyze`, {
        pgn: lichessResponse.data,
        depth: 12,
        timePerMove: 1500,
        username: 'DrNykterstein'
      });
      
      console.log('✅ Integration test successful');
      const analysis = analysisResponse.data.analysis;
      console.log(`- Accuracy: ${analysis.accuracy}%`);
      console.log(`- Total Moves: ${analysis.totalMoves}`);
      console.log(`- Opening: ${analysis.openingName}`);
      
    } else {
      console.log('❌ No PGN data received from Lichess');
    }
    
  } catch (error) {
    console.log('❌ Integration test failed:', error.response?.data || error.message);
    if (error.message.includes('API token')) {
      console.log('💡 Make sure LICHESS_API_TOKEN is set in .env file');
    }
  }
}

testPGNAnalysis().then(() => {
  console.log('\n' + '='.repeat(50));
  return testIntegrationWithLichess();
});
