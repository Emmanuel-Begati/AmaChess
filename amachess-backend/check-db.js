const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  try {
    const puzzleCount = await prisma.puzzle.count();
    console.log('Total puzzles in database:', puzzleCount);
    
    if (puzzleCount > 0) {
      const samplePuzzle = await prisma.puzzle.findFirst();
      console.log('Sample puzzle themes:', samplePuzzle.themes);
      console.log('Sample puzzle difficulty:', samplePuzzle.difficulty);
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
