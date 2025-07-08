require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma');

const testDB = async () => {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test user model (check if users table exists)
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible. Current user count: ${userCount}`);
    
    console.log('\n🎉 Database tests passed!');
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    
    if (error.message.includes('relation "users" does not exist')) {
      console.log('\n💡 It looks like the database migrations haven\'t been run.');
      console.log('   Please run: npx prisma db push');
      console.log('   Or: npx prisma migrate dev');
    }
  } finally {
    await prisma.$disconnect();
  }
};

testDB();
