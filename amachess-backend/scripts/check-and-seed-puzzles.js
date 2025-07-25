const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Basic puzzle data for seeding if database is empty
const basicPuzzles = [
  {
    id: 'basic-001',
    lichessId: 'basic-001',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
    moves: JSON.stringify(['Bxf7+', 'Kxf7', 'Ng5+']),
    rating: 1200,
    themes: JSON.stringify(['fork', 'tactics']),
    gameUrl: 'https://lichess.org/training',
    difficulty: 'Beginner',
    popularity: 85,
    description: 'Find the best move to win material',
    hint: 'Look for a forcing move that attacks the king',
    sideToMove: 'white',
    openingTags: JSON.stringify(['Italian Game'])
  },
  {
    id: 'basic-002',
    lichessId: 'basic-002',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    moves: JSON.stringify(['d4', 'exd4', 'Qxd4']),
    rating: 1000,
    themes: JSON.stringify(['opening', 'centerControl']),
    gameUrl: 'https://lichess.org/training',
    difficulty: 'Beginner',
    popularity: 90,
    description: 'Control the center with a pawn move',
    hint: 'Advance a central pawn',
    sideToMove: 'white',
    openingTags: JSON.stringify(['King\'s Pawn Opening'])
  },
  {
    id: 'basic-003',
    lichessId: 'basic-003',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
    moves: JSON.stringify(['Ng5', 'd6', 'Nxf7']),
    rating: 1400,
    themes: JSON.stringify(['sacrifice', 'attack']),
    gameUrl: 'https://lichess.org/training',
    difficulty: 'Intermediate',
    popularity: 78,
    description: 'Find the sacrificial attack',
    hint: 'Look for a knight sacrifice',
    sideToMove: 'white',
    openingTags: JSON.stringify(['Italian Game'])
  }
];

async function checkAndSeedPuzzles() {
  try {
    console.log('🔍 Checking puzzle database...');
    
    const puzzleCount = await prisma.puzzle.count();
    console.log(`📊 Current puzzle count: ${puzzleCount}`);
    
    if (puzzleCount === 0) {
      console.log('🌱 Database is empty. Seeding with basic puzzles...');
      
      for (const puzzle of basicPuzzles) {
        await prisma.puzzle.create({
          data: puzzle
        });
        console.log(`✅ Added puzzle: ${puzzle.id}`);
      }
      
      console.log(`🎉 Successfully seeded ${basicPuzzles.length} basic puzzles!`);
      
      // Verify seeding
      const newCount = await prisma.puzzle.count();
      console.log(`📊 New puzzle count: ${newCount}`);
    } else {
      console.log('✅ Database already contains puzzles. No seeding needed.');
      
      // Show some sample data
      const samplePuzzle = await prisma.puzzle.findFirst();
      console.log('📝 Sample puzzle:');
      console.log(`  ID: ${samplePuzzle.id}`);
      console.log(`  Difficulty: ${samplePuzzle.difficulty}`);
      console.log(`  Themes: ${samplePuzzle.themes.join(', ')}`);
      console.log(`  Rating: ${samplePuzzle.rating}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking/seeding puzzles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkAndSeedPuzzles()
    .then(() => {
      console.log('🏁 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkAndSeedPuzzles };
