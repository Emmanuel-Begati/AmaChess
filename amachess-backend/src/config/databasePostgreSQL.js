const { PrismaClient } = require('../generated/prisma');

// Enhanced Prisma client with PostgreSQL-optimized configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['warn', 'error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection pool and optimization for PostgreSQL
async function optimizeForPostgreSQL() {
  try {
    // Enable connection pooling optimizations
    await prisma.$executeRaw`SET statement_timeout = '30s'`;
    await prisma.$executeRaw`SET lock_timeout = '10s'`;
    await prisma.$executeRaw`SET idle_in_transaction_session_timeout = '5min'`;
    
    console.log('✅ PostgreSQL optimizations applied');
  } catch (error) {
    console.warn('⚠️  Could not apply PostgreSQL optimizations:', error.message);
  }
}

// Enhanced connection testing with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      
      // Test with a simple query
      await prisma.$queryRaw`SELECT 1 as test`;
      
      console.log('✅ Database connection successful');
      
      // Apply PostgreSQL optimizations if connected
      if (process.env.DATABASE_URL?.includes('postgresql')) {
        await optimizeForPostgreSQL();
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        console.error('❌ All database connection attempts failed');
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Database health check with detailed info
async function healthCheck() {
  try {
    const start = Date.now();
    
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    const responseTime = Date.now() - start;
    
    // Get database info
    const dbInfo = await getDatabaseInfo();
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      ...dbInfo
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Get database information and statistics
async function getDatabaseInfo() {
  try {
    const [
      userCount,
      puzzleCount,
      attemptCount,
      sessionCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.puzzle.count(),
      prisma.puzzleAttempt.count(),
      prisma.puzzleSession.count()
    ]);
    
    return {
      counts: {
        users: userCount,
        puzzles: puzzleCount,
        attempts: attemptCount,
        sessions: sessionCount
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Could not fetch database info:', error.message);
    return { counts: 'unavailable' };
  }
}

// Initialize database with proper setup
async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database connection...');
    
    // Test connection with retries
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database after multiple attempts');
    }

    // Check if this is PostgreSQL and log version
    if (process.env.DATABASE_URL?.includes('postgresql')) {
      try {
        const result = await prisma.$queryRaw`SELECT version() as version`;
        console.log('🐘 PostgreSQL version:', result[0]?.version?.split(' ')[1] || 'unknown');
      } catch (error) {
        console.warn('Could not fetch PostgreSQL version');
      }
    }

    // Run health check
    const health = await healthCheck();
    console.log('📊 Database health:', health);

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n📴 Received ${signal}, disconnecting from database...`);
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database disconnect:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

module.exports = {
  prisma,
  testConnection,
  initializeDatabase,
  healthCheck,
  getDatabaseInfo,
  
  // Export individual models for easier access
  User: prisma.user,
  Book: prisma.book,
  Puzzle: prisma.puzzle,
  PuzzleAttempt: prisma.puzzleAttempt,
  PuzzleSession: prisma.puzzleSession,
  UserStats: prisma.userStats,
};
