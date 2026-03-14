const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

async function checkPuzzles() {
    const prisma = new PrismaClient();
    try {
        const count = await prisma.puzzle.count();
        console.log('Total puzzles in database:', count);

        const stats = await prisma.puzzle.groupBy({
            by: ['difficulty'],
            _count: true
        });
        console.log('\nBy difficulty:');
        stats.forEach(s => console.log(`  ${s.difficulty}: ${s._count}`));

        const sample = await prisma.puzzle.findFirst();
        if (sample) {
            console.log('\nSample puzzle:', sample.lichessId, '- Rating:', sample.rating);
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkPuzzles().catch(console.error);
