const ChesscomService = require('./src/services/chesscomService');

async function quickTest() {
  const service = new ChesscomService();
  
  try {
    console.log('Testing with a simpler username...');
    const stats = await service.getUserStats('hikaru');
    console.log('✅ Chess.com integration working!');
    console.log(`Username: ${stats.username}`);
    console.log(`Total Games: ${stats.gameCount.total}`);
    console.log(`Rapid Rating: ${stats.rating.rapid || 'N/A'}`);
    console.log(`Win Rate: ${(stats.winRate * 100).toFixed(1)}%`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

quickTest();
