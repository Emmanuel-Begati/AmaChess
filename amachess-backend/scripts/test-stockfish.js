const StockfishService = require('../src/services/stockfishService');

async function testStockfish() {
  console.log('🧪 Testing Stockfish integration...');
  
  const stockfishService = new StockfishService();
  
  try {
    // Test 1: Basic position analysis
    console.log('\n1️⃣ Testing position analysis...');
    const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const analysis = await stockfishService.analyzePosition(startingPosition, 10, 1000);
    
    console.log('✅ Analysis result:', {
      bestMove: analysis.bestMove,
      evaluation: analysis.evaluation,
      depth: analysis.depth
    });

    // Test 2: AI coach move
    console.log('\n2️⃣ Testing AI coach move generation...');
    const coachMove = await stockfishService.getBestMove(startingPosition, 15, 10);
    
    console.log('✅ Coach move result:', {
      move: coachMove.move,
      evaluation: coachMove.evaluation
    });

    // Test 3: Hint generation
    console.log('\n3️⃣ Testing hint generation...');
    const hint = await stockfishService.generateHint(startingPosition, 'medium');
    
    console.log('✅ Hint result:', {
      hint: hint.hint,
      bestMove: hint.bestMove
    });

    // Test 4: Move evaluation
    console.log('\n4️⃣ Testing move evaluation...');
    const moveEvals = await stockfishService.evaluateMoves(startingPosition, ['e2e4', 'd2d4'], 8);
    
    console.log('✅ Move evaluations:', moveEvals);

    console.log('\n🎉 All Stockfish tests passed successfully!');
    console.log('🚀 Your AI Chess Coach is ready to use!');

  } catch (error) {
    console.error('❌ Stockfish test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Stockfish is installed: npm run install-stockfish');
    console.log('2. Check if Stockfish is in your PATH or in the stockfish folder');
    console.log('3. Verify the binary is executable');
  } finally {
    // Clean up any open engines
    stockfishService.closeAllEngines();
    process.exit(0);
  }
}

// Run the test
testStockfish();
