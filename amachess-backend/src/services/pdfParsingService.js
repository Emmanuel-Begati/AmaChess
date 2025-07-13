const pdfParse = require('pdf-parse');

class PDFParsingService {
  constructor() {
    // Minimal processing - just basic text extraction
  }

  /**
   * Extract PDF content with minimal processing
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {string} fileName - Original file name
   * @returns {Promise<Object>} Extracted content
   */
  async parsePDF(pdfBuffer, fileName) {
    try {
      console.log(`Extracting content from PDF: ${fileName}`);
      
      // Extract text using pdf-parse with minimal processing
      const pdfData = await pdfParse(pdfBuffer, {
        max: 0, // Parse all pages
        normalizeWhitespace: false, // Keep original formatting
      });
      
      const rawText = pdfData.text || '';
      console.log(`Extracted ${rawText.length} characters from PDF`);
      
      // Minimal text cleaning - just remove null characters and normalize line breaks
      const cleanedText = this.basicCleanText(rawText);
      
      // Create simple single-chapter structure
      const content = this.createBasicStructure(cleanedText, fileName, pdfData.numpages || 1);
      
      console.log(`PDF extraction complete for: ${fileName}`);
      return content;
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Return basic error structure
      return {
        content: `Could not extract text from PDF: ${fileName}\n\nError: ${error.message}`,
        chapters: [{
          id: 1,
          title: fileName,
          content: `Error extracting PDF content: ${error.message}`,
          pageStart: 1,
          pageEnd: 1
        }],
        chunks: [{
          id: 1,
          chapterId: 1,
          chapterTitle: fileName,
          content: `Error extracting PDF content: ${error.message}`,
          isPartial: false,
          wordCount: 0
        }],
        metadata: {
          fileName,
          totalPages: 1,
          extractedAt: new Date().toISOString(),
          characterCount: 0,
          wordCount: 0,
          hasError: true,
          errorMessage: error.message
        },
        positions: [],
        exercises: [],
        diagrams: []
      };
    }
  }

  /**
   * Basic text cleaning - minimal processing
   * @param {string} text 
   * @returns {string}
   */
  basicCleanText(text) {
    if (!text) return '';
    
    return text
      // Remove null characters and other control characters that can break display
      .replace(/\x00/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Trim leading/trailing whitespace
      .trim();
  }

  /**
   * Create basic structure with minimal processing
   * @param {string} text 
   * @param {string} fileName
   * @param {number} totalPages 
   * @returns {Object}
   */
  createBasicStructure(text, fileName, totalPages) {
    // Create a single chapter with all content - no complex parsing
    const chapter = {
      id: 1,
      title: fileName.replace('.pdf', ''),
      content: text,
      pageStart: 1,
      pageEnd: totalPages
    };

    // Create chunks for better reading experience (split long content)
    const chunks = this.createSimpleChunks(text, fileName, totalPages);

    return {
      content: text,
      chapters: [chapter],
      chunks: chunks,
      metadata: {
        fileName,
        totalPages,
        extractedAt: new Date().toISOString(),
        characterCount: text.length,
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
        hasError: false
      },
      // Keep empty arrays for compatibility with frontend
      positions: [],
      exercises: [],
      diagrams: []
    };
  }

  /**
   * Create simple chunks for pagination without complex parsing
   * @param {string} text 
   * @param {string} fileName
   * @param {number} totalPages
   * @returns {Array}
   */
  createSimpleChunks(text, fileName, totalPages) {
    const chunks = [];
    const chunkSize = 3000; // Larger chunks for better reading
    
    if (text.length <= chunkSize) {
      // Content fits in one chunk
      chunks.push({
        id: 1,
        chapterId: 1,
        chapterTitle: fileName.replace('.pdf', ''),
        content: text,
        isPartial: false,
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length
      });
    } else {
      // Split into multiple chunks
      let startIndex = 0;
      let chunkNumber = 1;
      
      while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + chunkSize, text.length);
        
        // Try to break at a paragraph or sentence end for better reading
        if (endIndex < text.length) {
          const lastNewline = text.lastIndexOf('\n\n', endIndex);
          const lastPeriod = text.lastIndexOf('. ', endIndex);
          const breakPoint = Math.max(lastNewline, lastPeriod);
          
          if (breakPoint > startIndex + chunkSize * 0.6) {
            endIndex = breakPoint + (lastNewline > lastPeriod ? 2 : 2);
          }
        }
        
        const chunkContent = text.substring(startIndex, endIndex).trim();
        
        chunks.push({
          id: chunkNumber,
          chapterId: 1,
          chapterTitle: chunkNumber === 1 ? fileName.replace('.pdf', '') : `${fileName.replace('.pdf', '')} (Page ${chunkNumber})`,
          content: chunkContent,
          isPartial: endIndex < text.length,
          wordCount: chunkContent.split(/\s+/).filter(word => word.length > 0).length
        });
        
        startIndex = endIndex;
        chunkNumber++;
      }
    }
    
    return chunks;
  }

  /**
   * Simple method for compatibility - just returns the basic content
   * @param {string} text 
   * @returns {Object}
   */
  async parseChessContent(text) {
    // For backward compatibility, just return basic structure
    return this.createBasicStructure(text, 'Content', 1);
  }
}

module.exports = PDFParsingService;
