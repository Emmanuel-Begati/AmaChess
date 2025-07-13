const PDFParsingService = require('../src/services/pdfParsingService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Test script for enhanced PDF parsing with OCR support
 */
async function testEnhancedPDFParsing() {
  const pdfParsingService = new PDFParsingService();
  
  console.log('🧪 Testing Enhanced PDF Parsing Service...\n');
  
  // Check if uploads directory exists and has PDFs
  const uploadsDir = path.join(__dirname, '../uploads');
  
  try {
    const files = await fs.readdir(uploadsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('❌ No PDF files found in uploads directory');
      console.log('💡 Upload a chess PDF book to test the enhanced parsing features');
      return;
    }
    
    console.log(`📚 Found ${pdfFiles.length} PDF file(s) to test:`);
    pdfFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log();
    
    // Test with the first PDF file
    const testFile = pdfFiles[0];
    const filePath = path.join(uploadsDir, testFile);
    
    console.log(`🔍 Testing enhanced parsing with: ${testFile}`);
    console.log('━'.repeat(60));
    
    try {
      // Read PDF file
      const pdfBuffer = await fs.readFile(filePath);
      console.log(`📖 PDF file size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      
      // Parse with enhanced service
      console.log('⚡ Starting enhanced PDF parsing...');
      const startTime = Date.now();
      
      const result = await pdfParsingService.parsePDF(pdfBuffer, testFile);
      
      const endTime = Date.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Parsing completed in ${processingTime} seconds\n`);
      
      // Display results
      console.log('📊 PARSING RESULTS:');
      console.log('━'.repeat(60));
      
      console.log(`📝 Extraction Method: ${result.metadata.extractionMethod}`);
      console.log(`🔤 OCR Used: ${result.metadata.ocrUsed ? 'Yes' : 'No'}`);
      console.log(`✅ Extraction Success: ${result.metadata.extractionSuccess ? 'Yes' : 'No'}`);
      console.log(`📏 Text Length: ${result.metadata.cleanedLength?.toLocaleString()} characters`);
      console.log(`📊 Word Count: ${result.metadata.wordCount?.toLocaleString()} words`);
      console.log();
      
      console.log('📚 CONTENT STRUCTURE:');
      console.log('━'.repeat(60));
      console.log(`📖 Chapters: ${result.chapters.length}`);
      console.log(`🧩 Content Chunks: ${result.chunks.length}`);
      console.log(`♔ Chess Positions: ${result.positions.length}`);
      console.log(`🎯 Exercises: ${result.exercises.length}`);
      console.log(`📐 Diagrams: ${result.diagrams.length}`);
      console.log(`♞ Chess Board Images: ${result.chessBoardImages.length}`);
      console.log();
      
      if (result.chapters.length > 0) {
        console.log('📋 CHAPTER BREAKDOWN:');
        console.log('━'.repeat(60));
        result.chapters.slice(0, 5).forEach(chapter => {
          console.log(`  📝 ${chapter.title}`);
          console.log(`     └── ${chapter.content.length} characters`);
        });
        if (result.chapters.length > 5) {
          console.log(`  ... and ${result.chapters.length - 5} more chapters`);
        }
        console.log();
      }
      
      if (result.chunks.length > 0) {
        console.log('🧩 SMART CHUNKING ANALYSIS:');
        console.log('━'.repeat(60));
        
        const totalChunks = result.chunks.length;
        const chessContentChunks = result.chunks.filter(chunk => chunk.hasChessContent).length;
        const averageWordCount = Math.round(result.chunks.reduce((sum, chunk) => sum + (chunk.wordCount || 0), 0) / totalChunks);
        const totalReadingTime = result.chunks.reduce((sum, chunk) => sum + (chunk.readingTimeMinutes || 0), 0);
        
        console.log(`📊 Total Chunks: ${totalChunks}`);
        console.log(`♔ Chess Content Chunks: ${chessContentChunks} (${Math.round(chessContentChunks/totalChunks*100)}%)`);
        console.log(`📝 Text Only Chunks: ${totalChunks - chessContentChunks} (${Math.round((totalChunks-chessContentChunks)/totalChunks*100)}%)`);
        console.log(`📏 Average Chunk Size: ${averageWordCount} words`);
        console.log(`⏱️ Estimated Reading Time: ${Math.round(totalReadingTime)} minutes`);
        console.log();
        
        // Show sample chunks
        console.log('📝 SAMPLE CHUNKS:');
        console.log('━'.repeat(60));
        result.chunks.slice(0, 3).forEach((chunk, index) => {
          console.log(`🧩 Chunk ${index + 1}: ${chunk.chapterTitle}`);
          console.log(`   📏 ${chunk.wordCount} words, ${chunk.readingTimeMinutes} min read`);
          console.log(`   ♔ Chess Content: ${chunk.hasChessContent ? 'Yes' : 'No'}`);
          console.log(`   📊 Type: ${chunk.contentType}`);
          console.log(`   🎯 Complexity: ${chunk.chessContentSummary?.complexity || 'N/A'}`);
          if (chunk.content) {
            const preview = chunk.content.substring(0, 100).replace(/\n/g, ' ');
            console.log(`   📝 Preview: "${preview}${chunk.content.length > 100 ? '...' : ''}"`);
          }
          console.log();
        });
      }
      
      if (result.positions.length > 0) {
        console.log('♔ CHESS POSITIONS FOUND:');
        console.log('━'.repeat(60));
        result.positions.slice(0, 3).forEach((position, index) => {
          console.log(`${index + 1}. FEN: ${position.fen}`);
          if (position.context) {
            const contextPreview = position.context.substring(0, 80).replace(/\n/g, ' ');
            console.log(`   Context: "${contextPreview}..."`);
          }
          console.log();
        });
        if (result.positions.length > 3) {
          console.log(`... and ${result.positions.length - 3} more positions\n`);
        }
      }
      
      if (result.exercises.length > 0) {
        console.log('🎯 EXERCISES FOUND:');
        console.log('━'.repeat(60));
        result.exercises.slice(0, 3).forEach((exercise, index) => {
          console.log(`${index + 1}. Type: ${exercise.type} | Difficulty: ${exercise.difficulty}`);
          if (exercise.question) {
            const questionPreview = exercise.question.substring(0, 100).replace(/\n/g, ' ');
            console.log(`   Question: "${questionPreview}${exercise.question.length > 100 ? '...' : ''}"`);
          }
          if (exercise.solution) {
            console.log(`   Solution: ${exercise.solution}`);
          }
          console.log();
        });
        if (result.exercises.length > 3) {
          console.log(`... and ${result.exercises.length - 3} more exercises\n`);
        }
      }
      
      // Quality Assessment
      console.log('📈 PARSING QUALITY ASSESSMENT:');
      console.log('━'.repeat(60));
      
      let qualityScore = 0;
      const assessments = [];
      
      if (result.metadata.extractionSuccess) {
        qualityScore += 20;
        assessments.push('✅ Text extraction successful');
      } else {
        assessments.push('❌ Text extraction had issues');
      }
      
      if (result.metadata.cleanedLength > 1000) {
        qualityScore += 20;
        assessments.push('✅ Good amount of text extracted');
      } else {
        assessments.push('⚠️ Limited text content extracted');
      }
      
      if (result.chapters.length > 1) {
        qualityScore += 15;
        assessments.push('✅ Multiple chapters detected');
      }
      
      if (result.positions.length > 0) {
        qualityScore += 15;
        assessments.push('✅ Chess positions found');
      }
      
      if (result.exercises.length > 0) {
        qualityScore += 15;
        assessments.push('✅ Chess exercises detected');
      }
      
      if (result.chunks.length > 0 && result.chunks.every(chunk => chunk.wordCount > 50)) {
        qualityScore += 15;
        assessments.push('✅ Smart chunking successful');
      }
      
      assessments.forEach(assessment => console.log(assessment));
      console.log(`\n📊 Overall Quality Score: ${qualityScore}/100`);
      
      if (qualityScore >= 80) {
        console.log('🎉 Excellent parsing quality!');
      } else if (qualityScore >= 60) {
        console.log('👍 Good parsing quality');
      } else if (qualityScore >= 40) {
        console.log('⚠️ Moderate parsing quality - some improvements possible');
      } else {
        console.log('❌ Poor parsing quality - check PDF source and try OCR improvements');
      }
      
      // Suggestions
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('━'.repeat(60));
      
      if (!result.metadata.ocrUsed && result.metadata.cleanedLength < 1000) {
        console.log('🔧 Consider using OCR for better text extraction');
      }
      
      if (result.positions.length === 0 && result.exercises.length === 0) {
        console.log('🔧 This might not be a chess book, or chess content is in image format');
      }
      
      if (result.chunks.length > 50) {
        console.log('🔧 Large book detected - perfect for chunk-by-chunk reading');
      }
      
      if (result.metadata.hasParsingErrors) {
        console.log('🔧 Some parsing errors occurred - book is still readable but some features may be limited');
        if (result.metadata.processingNotes) {
          console.log(`   Details: ${result.metadata.processingNotes}`);
        }
      }
      
    } catch (parseError) {
      console.error('❌ Parsing failed:', parseError.message);
      console.log('\n🔍 This could be due to:');
      console.log('  • Complex PDF structure');
      console.log('  • Protected/encrypted PDF');
      console.log('  • Corrupted file');
      console.log('  • Memory limitations');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log('🧪 Enhanced PDF Parsing Test Complete');
}

// Run the test
if (require.main === module) {
  testEnhancedPDFParsing().catch(console.error);
}

module.exports = { testEnhancedPDFParsing };
