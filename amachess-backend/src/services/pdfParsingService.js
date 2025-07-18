const pdfParse = require('pdf-parse');

class PDFParsingService {
  constructor() {
    // Simple PDF handling - no complex parsing
  }

  /**
   * Simple PDF info extraction - just get page count and basic metadata
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {string} fileName - Original file name
   * @returns {Promise<Object>} Basic PDF info
   */
  async parsePDF(pdfBuffer, fileName) {
    try {
      console.log(`Getting basic info from PDF: ${fileName}`);
      
      // Just get basic PDF info like page count
      const pdfData = await pdfParse(pdfBuffer, {
        max: 1, // Only parse first page to get metadata
        pagerender: () => null, // Don't render pages
        normalizeWhitespace: false
      });
      
      const totalPages = pdfData.numpages || 1;
      console.log(`PDF has ${totalPages} pages`);
      
      // Return minimal structure for database compatibility
      return {
        content: '', // Empty content since we're not parsing text
        chapters: [{
          id: 1,
          title: fileName.replace('.pdf', ''),
          content: '',
          pageStart: 1,
          pageEnd: totalPages
        }],
        chunks: [{
          id: 1,
          chapterId: 1,
          chapterTitle: fileName.replace('.pdf', ''),
          content: 'PDF viewer content - use PDF mode to read this book.',
          isPartial: false,
          wordCount: 0,
          hasChessContent: false
        }],
        metadata: {
          fileName,
          totalPages,
          extractedAt: new Date().toISOString(),
          characterCount: 0,
          wordCount: 0,
          hasError: false,
          isPDFOnly: true
        },
        positions: [],
        exercises: [],
        diagrams: []
      };
      
    } catch (error) {
      console.error('PDF info extraction error:', error);
      
      // Return basic structure even on error
      return {
        content: '',
        chapters: [{
          id: 1,
          title: fileName.replace('.pdf', ''),
          content: '',
          pageStart: 1,
          pageEnd: 1
        }],
        chunks: [{
          id: 1,
          chapterId: 1,
          chapterTitle: fileName.replace('.pdf', ''),
          content: 'PDF file uploaded successfully. Use PDF mode to view.',
          isPartial: false,
          wordCount: 0,
          hasChessContent: false
        }],
        metadata: {
          fileName,
          totalPages: 1,
          extractedAt: new Date().toISOString(),
          characterCount: 0,
          wordCount: 0,
          hasError: true,
          errorMessage: error.message,
          isPDFOnly: true
        },
        positions: [],
        exercises: [],
        diagrams: []
      };
    }
  }

  /**
   * Compatibility method
   */
  async parseChessContent(text) {
    return {
      content: '',
      chapters: [],
      chunks: [],
      metadata: { isPDFOnly: true },
      positions: [],
      exercises: [],
      diagrams: []
    };
  }
}

module.exports = PDFParsingService;
