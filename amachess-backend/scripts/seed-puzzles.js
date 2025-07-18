const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class PuzzleSeeder {
  constructor() {
    this.csvPath = path.join(__dirname, '../utils/lichess_db_puzzle.csv');
    this.maxRows = parseInt(process.env.MAX_PUZZLES_TO_LOAD) || 50000;
    this.batchSize = 1000; // Insert in batches for better performance
  }

  async seedPuzzles() {
    console.log('🧩 Starting puzzle database seeding...');
    console.log(`📁 CSV Path: ${this.csvPath}`);
    console.log(`📊 Max puzzles to load: ${this.maxRows}`);

    try {
      // Check if CSV file exists
      if (!fs.existsSync(this.csvPath)) {
        throw new Error(`CSV file not found at ${this.csvPath}`);
      }

      // Clear existing puzzles (optional - comment out if you want to keep existing data)
      console.log('🗑️  Clearing existing puzzles...');
      await prisma.puzzle.deleteMany({});
      console.log('✅ Existing puzzles cleared');

      // Load and process puzzles
      const puzzles = await this.loadPuzzlesFromCSV();
      console.log(`📚 Loaded ${puzzles.length} puzzles from CSV`);

      // Insert puzzles in batches
      await this.insertPuzzlesInBatches(puzzles);

      console.log('🎉 Puzzle seeding completed successfully!');
      
      // Print some statistics
      await this.printStats();

    } catch (error) {
      console.error('❌ Error seeding puzzles:', error);
      throw error;
    }
  }

  async loadPuzzlesFromCSV() {
    return new Promise((resolve, reject) => {
      const puzzles = [];
      let rowCount = 0;

      const stream = fs.createReadStream(this.csvPath, { encoding: 'utf8' });

      stream
        .pipe(csv())
        .on('data', (row) => {
          if (rowCount >= this.maxRows) return;

          try {
            const puzzle = this.parsePuzzleRow(row);
            if (puzzle) {
              puzzles.push(puzzle);
              rowCount++;
              
              // Log progress
              if (rowCount % 5000 === 0) {
                console.log(`📥 Processed ${rowCount} puzzles...`);
              }
            }
          } catch (error) {
            console.warn(`⚠️  Skipping invalid puzzle row: ${error.message}`);
          }
        })
        .on('end', () => {
          console.log(`✅ Finished processing CSV. Total valid puzzles: ${puzzles.length}`);
          resolve(puzzles);
        })
        .on('error', (error) => {
          console.error('❌ Error reading CSV:', error);
          reject(error);
        });
    });
  }

  parsePuzzleRow(row) {
    // Validate required fields
    if (!row.PuzzleId || !row.FEN || !row.Moves) {
      return null;
    }

    const rating = parseInt(row.Rating) || 1500;
    const moves = row.Moves ? row.Moves.split(' ').filter(move => move.trim()) : [];
    const themes = row.Themes ? row.Themes.split(' ').filter(theme => theme.trim()) : [];

    // Skip puzzles with no moves or invalid data
    if (moves.length === 0) {
      return null;
    }

    return {
      lichessId: row.PuzzleId,
      fen: row.FEN,
      moves: moves,
      rating: rating,
      ratingDeviation: parseInt(row.RatingDeviation) || 0,
      popularity: parseInt(row.Popularity) || 0,
      nbPlays: parseInt(row.NbPlays) || 0,
      themes: themes,
      gameUrl: row.GameUrl || null,
      openingTags: row.OpeningTags || null,
      sideToMove: this.getSideToMoveFromFEN(row.FEN),
      difficulty: this.getDifficultyFromRating(rating),
      description: this.generateDescription(themes, rating),
      hint: this.generateHint(themes),
    };
  }

  async insertPuzzlesInBatches(puzzles) {
    console.log(`📦 Inserting ${puzzles.length} puzzles in batches of ${this.batchSize}...`);

    // PostgreSQL-optimized batch insertion with transaction management
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < puzzles.length; i += this.batchSize) {
      const batch = puzzles.slice(i, i + this.batchSize);
      
      try {
        // Use transaction for better performance and consistency
        await prisma.$transaction(async (tx) => {
          const result = await tx.puzzle.createMany({
            data: batch,
            skipDuplicates: true, // Skip puzzles that already exist
          });
          
          insertedCount += result.count;
        }, {
          maxWait: 10000, // 10 seconds
          timeout: 30000, // 30 seconds
        });

        // Progress update
        const progress = Math.round((i + batch.length) / puzzles.length * 100);
        console.log(`📈 Progress: ${progress}% (${insertedCount} puzzles inserted)`);

      } catch (error) {
        errorCount += batch.length;
        console.error(`❌ Error inserting batch starting at index ${i}:`, error.message);
        
        // Try to insert individually for this batch to identify problematic puzzles
        await this.insertIndividually(batch);
      }
    }

    console.log(`✅ Batch insertion completed:`);
    console.log(`   Successfully inserted: ${insertedCount} puzzles`);
    console.log(`   Errors: ${errorCount} puzzles`);
    
    return { inserted: insertedCount, errors: errorCount };
  }

  async insertIndividually(batch) {
    console.log(`🔧 Attempting individual insertion for ${batch.length} puzzles...`);
    
    for (const puzzle of batch) {
      try {
        await prisma.puzzle.create({
          data: puzzle
        });
      } catch (error) {
        console.warn(`⚠️  Failed to insert puzzle ${puzzle.lichessId}: ${error.message}`);
      }
    }
  }

  getSideToMoveFromFEN(fen) {
    const parts = fen.split(' ');
    return parts[1] === 'w' ? 'white' : 'black';
  }

  getDifficultyFromRating(rating) {
    if (rating < 1400) return 'Beginner';
    if (rating < 1800) return 'Intermediate';
    if (rating < 2200) return 'Advanced';
    return 'Expert';
  }

  generateDescription(themes, rating) {
    const difficulty = this.getDifficultyFromRating(rating);
    const mainTheme = themes && themes.length > 0 ? themes[0] : 'tactical';
    return `${difficulty} ${mainTheme} puzzle (${rating}). Find the best move.`;
  }

  generateHint(themes) {
    const hintMap = {
      'pin': 'Look for pieces that can be pinned to more valuable pieces',
      'fork': 'Find a move that attacks two pieces at once',
      'skewer': 'Force a valuable piece to move and attack what\'s behind it',
      'deflection': 'Remove the defender of an important piece or square',
      'discoveredAttack': 'Move a piece to reveal an attack from behind',
      'backRank': 'Look for weaknesses on the back rank',
      'sacrifice': 'Consider giving up material for a greater advantage',
      'mate': 'Look for a forced checkmate sequence',
      'endgame': 'Focus on king activity and pawn promotion',
    };

    if (themes && themes.length > 0) {
      const theme = themes[0].toLowerCase();
      return hintMap[theme] || 'Look for the most forcing moves first';
    }

    return 'Look for tactics and forcing moves';
  }

  async printStats() {
    console.log('\\n📊 PUZZLE DATABASE STATISTICS:');
    
    const totalPuzzles = await prisma.puzzle.count();
    console.log(`Total puzzles: ${totalPuzzles.toLocaleString()}`);

    // Stats by difficulty
    const difficultyStats = await prisma.puzzle.groupBy({
      by: ['difficulty'],
      _count: true,
    });

    console.log('\\nBy difficulty:');
    difficultyStats.forEach(stat => {
      console.log(`  ${stat.difficulty}: ${stat._count.toLocaleString()}`);
    });

    // Rating distribution
    const avgRating = await prisma.puzzle.aggregate({
      _avg: { rating: true },
      _min: { rating: true },
      _max: { rating: true },
    });

    console.log('\\nRating distribution:');
    console.log(`  Average: ${Math.round(avgRating._avg.rating || 0)}`);
    console.log(`  Min: ${avgRating._min.rating || 0}`);
    console.log(`  Max: ${avgRating._max.rating || 0}`);

    // Most common themes
    const allPuzzles = await prisma.puzzle.findMany({
      select: { themes: true },
      take: 1000, // Sample for performance
    });

    const themeCount = {};
    allPuzzles.forEach(puzzle => {
      puzzle.themes.forEach(theme => {
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    console.log('\\nTop 10 themes (from sample):');
    topThemes.forEach(([theme, count]) => {
      console.log(`  ${theme}: ${count}`);
    });

    console.log('\\n🎉 Database ready for use!');
  }
}

// Run the seeder if called directly
async function main() {
  const seeder = new PuzzleSeeder();
  
  try {
    await seeder.seedPuzzles();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { PuzzleSeeder };
