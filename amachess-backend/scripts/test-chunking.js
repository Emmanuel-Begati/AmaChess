const PDFParsingService = require('../src/services/pdfParsingService');

/**
 * Simple unit test for enhanced chunking functionality
 */
async function testEnhancedChunking() {
  console.log('🧪 Testing Enhanced Chunking Functionality...\n');
  
  const pdfParsingService = new PDFParsingService();
  
  // Test with sample chess content
  const sampleChessText = `
# Chess Fundamentals

## Chapter 1: Opening Principles

The opening is the first phase of a chess game. In this phase, players develop their pieces and try to control the center of the board.

### Basic Opening Principles

1. Control the center with pawns (e4, d4)
2. Develop knights before bishops  
3. Castle early for king safety
4. Don't move the same piece twice

Position after 1.e4 e5 2.Nf3 Nc6 3.Bb5:
rnbqkb1r/pppp1ppp/5n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3

This is the Ruy Lopez opening, one of the oldest chess openings.

## Chapter 2: Tactical Motifs

### Exercise 1
White to move and win material.
Position: r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1

Solution: Nxe5! This knight fork wins the queen.

### The Pin

A pin is a tactical motif where a piece cannot move because it would expose a more valuable piece behind it.

Diagram: After Bb5+ in the Ruy Lopez
rnbqkb1r/pppp1ppp/5n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3

The bishop pins the knight to the king.

## Chapter 3: Endgame Basics

King and pawn versus king is the most fundamental endgame.

### Exercise 2  
White to move and promote the pawn.
Position: 8/8/8/8/8/8/4P3/4K1k1 w - - 0 1

The key is to support the pawn with the king.

### Opposition

Opposition is a key concept in king and pawn endgames. The player not to move has the opposition.
`;

  try {
    console.log('📝 Processing sample chess content...');
    
    // Test the chess content parsing
    const result = await pdfParsingService.parseChessContent(sampleChessText);
    
    console.log('✅ Content parsing completed\n');
    
    // Display results
    console.log('📊 PARSING RESULTS:');
    console.log('━'.repeat(50));
    console.log(`📖 Chapters found: ${result.chapters.length}`);
    console.log(`🧩 Content chunks: ${result.chunks.length}`);
    console.log(`♔ Chess positions: ${result.positions.length}`);
    console.log(`🎯 Exercises: ${result.exercises.length}`);
    console.log(`📐 Diagrams: ${result.diagrams.length}`);
    
    // Test chunking quality
    console.log('\n🧩 CHUNK ANALYSIS:');
    console.log('━'.repeat(50));
    
    result.chunks.forEach((chunk, index) => {
      console.log(`\n${index + 1}. ${chunk.chapterTitle}`);
      console.log(`   📏 ${chunk.wordCount} words | ⏱️ ${chunk.readingTimeMinutes} min read`);
      console.log(`   ♔ Chess content: ${chunk.hasChessContent ? 'Yes' : 'No'}`);
      console.log(`   🎯 Type: ${chunk.contentType}`);
      
      if (chunk.chessContentSummary) {
        const summary = chunk.chessContentSummary;
        console.log(`   📊 Positions: ${summary.positionCount} | Exercises: ${summary.exerciseCount} | Diagrams: ${summary.diagramCount}`);
        console.log(`   🎓 Complexity: ${summary.complexity}`);
      }
      
      // Show content preview
      if (chunk.content) {
        const preview = chunk.content.substring(0, 100).replace(/\s+/g, ' ').trim();
        console.log(`   📝 Preview: "${preview}..."`);
      }
    });
    
    // Test chess content extraction
    if (result.positions.length > 0) {
      console.log('\n♔ CHESS POSITIONS:');
      console.log('━'.repeat(50));
      result.positions.forEach((pos, index) => {
        console.log(`${index + 1}. ${pos.fen}`);
        if (pos.context) {
          const context = pos.context.substring(0, 80).replace(/\s+/g, ' ');
          console.log(`   Context: "${context}..."`);
        }
      });
    }
    
    if (result.exercises.length > 0) {
      console.log('\n🎯 EXERCISES:');
      console.log('━'.repeat(50));
      result.exercises.forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.question || 'Exercise'}`);
        console.log(`   Type: ${ex.type} | Difficulty: ${ex.difficulty}`);
        if (ex.solution) {
          console.log(`   Solution: ${ex.solution}`);
        }
        if (ex.fen) {
          console.log(`   Position: ${ex.fen}`);
        }
      });
    }
    
    // Test navigation
    console.log('\n🧭 NAVIGATION TEST:');
    console.log('━'.repeat(50));
    result.chunks.forEach((chunk, index) => {
      if (chunk.navigation) {
        const nav = chunk.navigation;
        console.log(`Chunk ${index + 1}: Prev=${nav.previousChunk || 'none'} | Next=${nav.nextChunk || 'none'} | ${nav.chunkIndex}/${nav.totalChunks}`);
      }
    });
    
    // Quality assessment
    console.log('\n📈 QUALITY ASSESSMENT:');
    console.log('━'.repeat(50));
    
    let score = 0;
    const assessments = [];
    
    if (result.chapters.length >= 3) {
      score += 20;
      assessments.push('✅ Multiple chapters detected');
    }
    
    if (result.positions.length > 0) {
      score += 25;
      assessments.push('✅ Chess positions found');
    }
    
    if (result.exercises.length > 0) {
      score += 25;
      assessments.push('✅ Exercises detected');
    }
    
    if (result.chunks.length > 0 && result.chunks.every(chunk => chunk.wordCount > 10)) {
      score += 20;
      assessments.push('✅ Smart chunking successful');
    }
    
    if (result.chunks.some(chunk => chunk.hasChessContent)) {
      score += 10;
      assessments.push('✅ Chess content categorization working');
    }
    
    assessments.forEach(assessment => console.log(`   ${assessment}`));
    console.log(`\n📊 Overall Score: ${score}/100`);
    
    if (score >= 80) {
      console.log('🎉 Excellent! Enhanced parsing is working perfectly.');
    } else if (score >= 60) {
      console.log('👍 Good! Most enhanced features are working.');
    } else {
      console.log('⚠️ Some issues detected. Check individual components.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n━'.repeat(50));
  console.log('🧪 Enhanced Chunking Test Complete');
}

// Run the test
testEnhancedChunking().catch(console.error);
