const PDFParsingService = require('../src/services/pdfParsingService');
const prisma = require('../src/config/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script to re-process existing PDFs with enhanced parsing
 */
async function reprocessExistingPDFs() {
  console.log('🔄 Starting PDF Re-processing with Enhanced Parser...\n');
  
  try {
    // Get all books that may need reprocessing
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { status: 'processed_with_errors' },
          { status: 'failed' },
          {
            AND: [
              { status: 'processed' },
              { content: { not: null } }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (books.length === 0) {
      console.log('📚 No books found that need reprocessing');
      return;
    }
    
    console.log(`📚 Found ${books.length} book(s) that could benefit from enhanced processing:`);
    books.forEach((book, index) => {
      console.log(`   ${index + 1}. ${book.title} by ${book.author} (Status: ${book.status})`);
    });
    console.log();
    
    const pdfParsingService = new PDFParsingService();
    
    for (let i = 0; i < Math.min(books.length, 3); i++) { // Process max 3 books to avoid overload
      const book = books[i];
      console.log(`🔍 Processing "${book.title}"...`);
      console.log('━'.repeat(60));
      
      try {
        // Check if PDF file still exists
        if (!book.pdfPath || !await fileExists(book.pdfPath)) {
          console.log('❌ PDF file not found, skipping...\n');
          continue;
        }
        
        // Read PDF file
        const pdfBuffer = await fs.readFile(book.pdfPath);
        console.log(`📖 File size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Parse with enhanced service
        console.log('⚡ Running enhanced parsing...');
        const startTime = Date.now();
        
        const result = await pdfParsingService.parsePDF(pdfBuffer, book.originalFileName);
        
        const endTime = Date.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`✅ Enhanced parsing completed in ${processingTime} seconds`);
        
        // Compare results with existing content
        let existingContent = {};
        try {
          existingContent = book.content ? JSON.parse(book.content) : {};
        } catch (error) {
          console.log('⚠️ Existing content was corrupted, replacing with new version');
        }
        
        const oldChapters = existingContent.chapters?.length || 0;
        const oldPositions = existingContent.positions?.length || 0;
        const oldExercises = existingContent.exercises?.length || 0;
        
        const newChapters = result.chapters?.length || 0;
        const newPositions = result.positions?.length || 0;
        const newExercises = result.exercises?.length || 0;
        const newChunks = result.chunks?.length || 0;
        
        console.log('📊 Comparison:');
        console.log(`   Chapters: ${oldChapters} → ${newChapters} ${getChangeIndicator(oldChapters, newChapters)}`);
        console.log(`   Positions: ${oldPositions} → ${newPositions} ${getChangeIndicator(oldPositions, newPositions)}`);
        console.log(`   Exercises: ${oldExercises} → ${newExercises} ${getChangeIndicator(oldExercises, newExercises)}`);
        console.log(`   Chunks: N/A → ${newChunks} ✨ (new feature)`);
        console.log(`   OCR Used: ${result.metadata.ocrUsed ? 'Yes' : 'No'}`);
        console.log(`   Extraction Method: ${result.metadata.extractionMethod}`);
        
        // Update database with enhanced content
        const newStatus = result.metadata.hasParsingErrors ? 'processed_with_errors' : 'processed';
        
        await prisma.book.update({
          where: { id: book.id },
          data: {
            content: JSON.stringify(result),
            totalPages: result.chunks ? result.chunks.length : 1,
            status: newStatus,
            diagramMap: JSON.stringify({
              positions: result.positions || [],
              diagrams: result.diagrams || [],
              exercises: result.exercises || []
            }),
            processedAt: new Date()
          }
        });
        
        console.log(`✅ Database updated successfully with enhanced content\n`);
        
      } catch (error) {
        console.error(`❌ Failed to reprocess "${book.title}":`, error.message);
        
        // Update status to indicate reprocessing failed
        await prisma.book.update({
          where: { id: book.id },
          data: {
            status: 'reprocessing_failed',
            // Keep existing content
          }
        });
        
        console.log('📝 Book status updated to indicate reprocessing failure\n');
      }
    }
    
    if (books.length > 3) {
      console.log(`💡 ${books.length - 3} more books available for reprocessing. Run script again to continue.`);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log('🔄 PDF Re-processing Complete');
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get change indicator for comparison
 */
function getChangeIndicator(oldValue, newValue) {
  if (newValue > oldValue) {
    return `📈 (+${newValue - oldValue})`;
  } else if (newValue < oldValue) {
    return `📉 (-${oldValue - newValue})`;
  } else {
    return '➡️';
  }
}

// Run the script
if (require.main === module) {
  reprocessExistingPDFs().catch(console.error);
}

module.exports = { reprocessExistingPDFs };
