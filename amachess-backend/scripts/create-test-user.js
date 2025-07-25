const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user123 already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'user123' }
    });

    if (existingUser) {
      console.log('✅ Test user user123 already exists');
      return existingUser;
    }

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword123',
        name: 'Test User',
        lichessUsername: 'testuser123',
        country: 'US'
      }
    });

    console.log('✅ Created test user:', testUser);
    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log('🎉 Test user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create test user:', error);
    process.exit(1);
  });
