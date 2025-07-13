const PDFParsingService = require('../src/services/pdfParsingService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Simple test for chess book parsing
 */
async function testChessBookParsing() {
  console.log('🧪 Testing Chess Book PDF Parsing...\n');
  
  const pdfParsingService = new PDFParsingService();
  
  // Test with the endgame book
  const testFile = '1752365995094_jesus_de_la_villa-100_endgames_you_must_know_(2008).pdf';
  const filePath = path.join(__dirname, '../uploads', testFile);
  
  try {
    console.log(`📖 Testing with: ${testFile}`);
    
    // Check if file exists
    await fs.access(filePath);
    
    // Read PDF file
    const pdfBuffer = await fs.readFile(filePath);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Parse without OCR to test basic functionality
    console.log('⚡ Starting basic PDF parsing (no OCR)...');
    const startTime = Date.now();
    
    const result = await pdfParsingService.parsePDF(pdfBuffer, testFile);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Parsing completed in ${processingTime} seconds\n`);
    
    // Display key results
    console.log('📊 PARSING RESULTS:');
    console.log('━'.repeat(50));
    console.log(`🔤 Text Length: ${result.metadata.cleanedLength?.toLocaleString()} characters`);
    console.log(`📖 Chapters: ${result.chapters.length}`);
    console.log(`🧩 Content Chunks: ${result.chunks.length}`);
    console.log(`♔ Chess Positions: ${result.positions.length}`);
    console.log(`🎯 Exercises: ${result.exercises.length}`);
    console.log(`📐 Diagrams: ${result.diagrams.length}`);
    
    // Test chunking quality
    if (result.chunks.length > 0) {
      console.log('\n🧩 CHUNKING ANALYSIS:');
      console.log('━'.repeat(50));
      
      const avgWordCount = Math.round(result.chunks.reduce((sum, chunk) => sum + (chunk.wordCount || 0), 0) / result.chunks.length);
      const chessChunks = result.chunks.filter(chunk => chunk.hasChessContent).length;
      
      console.log(`📊 Average chunk size: ${avgWordCount} words`);
      console.log(`♔ Chess content chunks: ${chessChunks}/${result.chunks.length}`);
      
      // Show first few chunks
      console.log('\n📝 SAMPLE CHUNKS:');
      result.chunks.slice(0, 3).forEach((chunk, index) => {
        console.log(`\n${index + 1}. ${chunk.chapterTitle}`);
        console.log(`   📏 ${chunk.wordCount} words | ⏱️ ${chunk.readingTimeMinutes} min`);
        console.log(`   ♔ Chess content: ${chunk.hasChessContent ? 'Yes' : 'No'}`);
        console.log(`   🎯 Type: ${chunk.contentType || 'text'}`);
        
        if (chunk.content && chunk.content.length > 100) {
          const preview = chunk.content.substring(0, 150).replace(/\s+/g, ' ');
          console.log(`   📝 Preview: "${preview}..."`);
        }
      });
    }
    
    // Check for chess content specifically
    if (result.positions.length > 0) {
      console.log('\n♔ CHESS POSITIONS SAMPLE:');
      console.log('━'.repeat(50));
      result.positions.slice(0, 2).forEach((pos, index) => {
        console.log(`${index + 1}. ${pos.fen}`);
        if (pos.context) {
          const contextPreview = pos.context.substring(0, 100).replace(/\s+/g, ' ');
          console.log(`   Context: "${contextPreview}..."`);
        }
      });
    }
    
    if (result.exercises.length > 0) {
      console.log('\n🎯 EXERCISES SAMPLE:');
      console.log('━'.repeat(50));
      result.exercises.slice(0, 2).forEach((ex, index) => {
        console.log(`${index + 1}. Type: ${ex.type} | Difficulty: ${ex.difficulty}`);
        if (ex.question) {
          const questionPreview = ex.question.substring(0, 100).replace(/\s+/g, ' ');
          console.log(`   Question: "${questionPreview}..."`);
        }
        if (ex.solution) {
          console.log(`   Solution: ${ex.solution}`);
        }
      });
    }
    
    // Quality assessment
    console.log('\n📈 QUALITY ASSESSMENT:');
    console.log('━'.repeat(50));
    
    let score = 0;
    if (result.metadata.extractionSuccess) score += 25;
    if (result.metadata.cleanedLength > 5000) score += 25;
    if (result.chapters.length > 1) score += 20;
    if (result.positions.length > 0) score += 15;
    if (result.exercises.length > 0) score += 15;
    
    console.log(`📊 Quality Score: ${score}/100`);
    
    if (score >= 80) {
      console.log('🎉 Excellent - This looks like a well-processed chess book!');
    } else if (score >= 60) {
      console.log('👍 Good - Most features are working well');
    } else {
      console.log('⚠️ Moderate - Basic parsing successful, some chess features may be limited');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n━'.repeat(50));
  console.log('🧪 Chess Book Parsing Test Complete');
}

// Run the test
testChessBookParsing().catch(console.error);
