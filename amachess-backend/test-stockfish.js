const StockfishService = require('./src/services/stockfishService');

async function testStockfish() {
  console.log('Testing Stockfish integration...');
  
  const stockfishService = new StockfishService();
  
  try {
    console.log('1. Testing engine creation...');
    const result = await stockfishService.getBestMoveWithDifficulty(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'beginner',
      3000
    );
    
    console.log('✅ Stockfish test successful!');
    console.log('Best move:', result.bestMove);
    console.log('Evaluation:', result.evaluation);
    console.log('Time used:', result.timeUsed + 'ms');
    
  } catch (error) {
    console.error('❌ Stockfish test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Stockfish is installed on your system');
    console.log('2. Add Stockfish to your PATH environment variable');
    console.log('3. Or place stockfish.exe in the stockfish/ directory');
  } finally {
    stockfishService.closeAllEngines();
    process.exit(0);
  }
}

testStockfish();
