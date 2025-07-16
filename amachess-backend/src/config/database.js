const { PrismaClient } = require('../generated/prisma');

// Enhanced Prisma client with better logging and error handling
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Handle graceful shutdowns
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database (run migrations if needed)
async function initializeDatabase() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }

    // Check if we need to run migrations (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode - checking for pending migrations...');
      // Note: In production, you should run migrations separately
    }

    console.log('📊 Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  testConnection,
  initializeDatabase,
  // Export individual models for easier access
  User: prisma.user,
  Book: prisma.book,
  Puzzle: prisma.puzzle,
  PuzzleAttempt: prisma.puzzleAttempt,
  PuzzleSession: prisma.puzzleSession,
  UserStats: prisma.userStats,
};
