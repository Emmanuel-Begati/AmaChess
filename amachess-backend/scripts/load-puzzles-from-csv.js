const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// Path to the CSV file
const CSV_FILE_PATH = path.join(__dirname, '..', 'utils', 'lichess_db_puzzle.csv');

// Batch size for database insertions
const BATCH_SIZE = 1000;
const MAX_PUZZLES = 10000; // Limit for initial load to avoid overwhelming the database

// Difficulty mapping based on rating
function getDifficulty(rating) {
  if (rating < 1200) return 'Beginner';
  if (rating < 1600) return 'Intermediate';
  if (rating < 2000) return 'Advanced';
  return 'Expert';
}

// Generate description based on themes and rating
function generateDescription(themes, rating) {
  const themeList = themes.split(' ');
  const mainTheme = themeList[0];
  
  const descriptions = {
    'mate': 'Find the checkmate sequence',
    'mateIn1': 'Checkmate in one move',
    'mateIn2': 'Checkmate in two moves',
    'mateIn3': 'Checkmate in three moves',
    'fork': 'Find the fork that wins material',
    'pin': 'Use a pin to win material',
    'skewer': 'Find the skewer',
    'discoveredAttack': 'Execute a discovered attack',
    'deflection': 'Deflect the defender',
    'attraction': 'Attract the piece to a better square',
    'clearance': 'Clear the line for attack',
    'interference': 'Interfere with the opponent\'s pieces',
    'sacrifice': 'Find the winning sacrifice',
    'crushing': 'Find the crushing move',
    'advantage': 'Find the move that gives a clear advantage',
    'endgame': 'Solve this endgame position',
    'middlegame': 'Find the best middlegame move',
    'opening': 'Play the correct opening move'
  };
  
  return descriptions[mainTheme] || `Solve this ${rating}-rated puzzle`;
}

// Generate hint based on themes
function generateHint(themes) {
  const themeList = themes.split(' ');
  const mainTheme = themeList[0];
  
  const hints = {
    'mate': 'Look for a forcing sequence that leads to checkmate',
    'mateIn1': 'Find the move that delivers immediate checkmate',
    'mateIn2': 'Find the first move of a two-move checkmate',
    'mateIn3': 'Start the three-move checkmate sequence',
    'fork': 'Look for a move that attacks two pieces at once',
    'pin': 'Find a move that pins an opponent\'s piece',
    'skewer': 'Attack a valuable piece forcing it to move',
    'discoveredAttack': 'Move a piece to reveal an attack',
    'deflection': 'Force the defender away from its duty',
    'attraction': 'Force the piece to a vulnerable square',
    'sacrifice': 'Consider giving up material for a greater gain',
    'crushing': 'Look for a move that dominates the position',
    'advantage': 'Find the move that improves your position',
    'endgame': 'Focus on king and pawn coordination',
    'middlegame': 'Look for tactical opportunities',
    'opening': 'Develop pieces and control the center'
  };
  
  return hints[mainTheme] || 'Look for the best move in this position';
}

async function loadPuzzlesFromCSV() {
  try {
    console.log('🔍 Checking if CSV file exists...');
    
    if (!fs.existsSync(CSV_FILE_PATH)) {
      throw new Error(`CSV file not found at: ${CSV_FILE_PATH}`);
    }
    
    console.log('✅ CSV file found. Starting puzzle import...');
    
    // Check current puzzle count
    const currentCount = await prisma.puzzle.count();
    console.log(`📊 Current puzzles in database: ${currentCount}`);
    
    if (currentCount > 100) {
      console.log('⚠️  Database already has puzzles. Clearing existing puzzles first...');
      await prisma.puzzle.deleteMany({});
      console.log('✅ Cleared existing puzzles.');
    }
    
    const puzzles = [];
    let processedCount = 0;
    let errorCount = 0;
    
    console.log(`📖 Reading CSV file and processing up to ${MAX_PUZZLES} puzzles...`);
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
          try {
            if (processedCount >= MAX_PUZZLES) {
              return; // Skip if we've reached the limit
            }
            
            // Parse and validate the row data
            const puzzleId = row.PuzzleId;
            const fen = row.FEN;
            const moves = row.Moves ? row.Moves.split(' ') : [];
            const rating = parseInt(row.Rating) || 1500;
            const themes = row.Themes ? row.Themes.split(' ') : ['tactics'];
            const gameUrl = row.GameUrl || '';
            const openingTags = row.OpeningTags ? row.OpeningTags.split(' ') : [];
            
            // Skip invalid puzzles
            if (!puzzleId || !fen || moves.length === 0) {
              errorCount++;
              return;
            }
            
            // Determine side to move from FEN
            const fenParts = fen.split(' ');
            const sideToMove = fenParts[1] === 'w' ? 'white' : 'black';
            
            const puzzle = {
              id: `lichess-${puzzleId}`,
              lichessId: puzzleId,
              fen: fen,
              moves: JSON.stringify(moves),
              rating: rating,
              ratingDeviation: parseInt(row.RatingDeviation) || 75,
              popularity: parseInt(row.Popularity) || 50,
              nbPlays: parseInt(row.NbPlays) || 0,
              themes: JSON.stringify(themes),
              gameUrl: gameUrl,
              openingTags: JSON.stringify(openingTags),
              sideToMove: sideToMove,
              difficulty: getDifficulty(rating),
              description: generateDescription(row.Themes || 'tactics', rating),
              hint: generateHint(row.Themes || 'tactics')
            };
            
            puzzles.push(puzzle);
            processedCount++;
            
            // Log progress every 1000 puzzles
            if (processedCount % 1000 === 0) {
              console.log(`📈 Processed ${processedCount} puzzles...`);
            }
            
          } catch (error) {
            errorCount++;
            if (errorCount < 10) { // Only log first 10 errors
              console.error(`❌ Error processing row ${processedCount}:`, error.message);
            }
          }
        })
        .on('end', async () => {
          try {
            console.log(`📋 Finished reading CSV. Processed ${processedCount} puzzles, ${errorCount} errors.`);
            console.log('💾 Inserting puzzles into database...');
            
            // Insert puzzles in batches
            for (let i = 0; i < puzzles.length; i += BATCH_SIZE) {
              const batch = puzzles.slice(i, i + BATCH_SIZE);
              
              try {
                await prisma.puzzle.createMany({
                  data: batch
                });
                
                console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(puzzles.length / BATCH_SIZE)} (${batch.length} puzzles)`);
              } catch (batchError) {
                console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError.message);
              }
            }
            
            // Verify final count
            const finalCount = await prisma.puzzle.count();
            console.log(`🎉 Import completed! Total puzzles in database: ${finalCount}`);
            
            // Show some sample statistics
            const stats = await prisma.puzzle.groupBy({
              by: ['difficulty'],
              _count: true,
            });
            
            console.log('\n📊 Puzzle distribution by difficulty:');
            stats.forEach(stat => {
              console.log(`  ${stat.difficulty}: ${stat._count}`);
            });
            
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('❌ Error loading puzzles from CSV:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  loadPuzzlesFromCSV()
    .then(() => {
      console.log('🏁 Puzzle import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Puzzle import failed:', error);
      process.exit(1);
    });
}

module.exports = { loadPuzzlesFromCSV };
