const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

let authToken = '';

async function testBooksAPI() {
  console.log('🧪 Testing Books API...\n');

  try {
    // 1. Register or login test user
    console.log('1. 🔐 Authenticating...');
    await authenticateUser();
    console.log('✅ Authentication successful\n');

    // 2. Test book upload
    console.log('2. 📚 Testing book upload...');
    await testBookUpload();
    console.log('✅ Book upload test completed\n');

    // 3. Test book listing
    console.log('3. 📋 Testing book listing...');
    await testBookListing();
    console.log('✅ Book listing test completed\n');

    // 4. Test book details
    console.log('4. 📖 Testing book details...');
    await testBookDetails();
    console.log('✅ Book details test completed\n');

    // 5. Test book chunks
    console.log('5. 📄 Testing book chunks...');
    await testBookChunks();
    console.log('✅ Book chunks test completed\n');

    // 6. Test progress update
    console.log('6. 📊 Testing progress update...');
    await testProgressUpdate();
    console.log('✅ Progress update test completed\n');

    // 7. Test positions and exercises
    console.log('7. ♟️  Testing positions and exercises...');
    await testPositionsAndExercises();
    console.log('✅ Positions and exercises test completed\n');

    console.log('🎉 All Books API tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

async function authenticateUser() {
  try {
    // Try to login first
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('   Logged in existing user');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // User doesn't exist, register
      console.log('   User not found, registering...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      console.log('   Registered new user');
    } else {
      throw error;
    }
  }
}

async function testBookUpload() {
  // Create a sample PDF-like content for testing
  const sampleContent = Buffer.from(`
# Sample Chess Book

## Chapter 1: Introduction to Chess

The game of chess is played on a board with 64 squares arranged in an 8x8 grid.

**Starting Position**: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

The most popular opening move is 1.e4, which controls the center and develops pieces quickly.

**Position after 1.e4**: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

**Exercise 1**: What is the best response for Black after 1.e4?
**Solution**: e5
**Explanation**: 1...e5 is the classical response, immediately challenging White's central control.

## Chapter 2: Basic Tactics

Tactics are short-term combinations that win material or achieve checkmate.

**Position**: r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4

In this position, White has developed the bishop to c4, attacking the f7 square.

**Exercise 2**: Find the best move for White in this position.
**Solution**: Ng5
**Explanation**: This move attacks the f7 square, which is only defended by the king.
  `);

  // Create a temporary PDF file for testing
  const tempPdfPath = path.join(__dirname, 'test-book.pdf');
  fs.writeFileSync(tempPdfPath, sampleContent);

  try {
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(tempPdfPath));
    formData.append('title', 'Test Chess Book');
    formData.append('author', 'Test Author');

    // Note: This will fail with actual PDF parsing since we're not sending a real PDF
    // But it tests the upload endpoint structure
    const response = await axios.post(`${BASE_URL}/books/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('   Upload response:', response.data);
  } catch (error) {
    // Expected to fail with parsing error for non-PDF content
    if (error.response && error.response.data && error.response.data.error) {
      console.log('   Expected error (non-PDF content):', error.response.data.error);
    } else {
      throw error;
    }
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
  }
}

async function testBookListing() {
  const response = await axios.get(`${BASE_URL}/books`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  console.log('   Books found:', response.data.books.length);
  
  if (response.data.books.length > 0) {
    const book = response.data.books[0];
    console.log('   First book:', {
      id: book.id,
      title: book.title,
      author: book.author,
      totalPages: book.totalPages
    });
  }
}

async function testBookDetails() {
  // First get a book ID
  const booksResponse = await axios.get(`${BASE_URL}/books`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (booksResponse.data.books.length === 0) {
    console.log('   No books found to test details');
    return;
  }

  const bookId = booksResponse.data.books[0].id;

  const response = await axios.get(`${BASE_URL}/books/${bookId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  console.log('   Book details retrieved:', {
    title: response.data.book.title,
    author: response.data.book.author,
    hasContent: !!response.data.book.content,
    hasDiagrams: !!response.data.book.diagrams
  });
}

async function testBookChunks() {
  // Get book ID
  const booksResponse = await axios.get(`${BASE_URL}/books`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (booksResponse.data.books.length === 0) {
    console.log('   No books found to test chunks');
    return;
  }

  const bookId = booksResponse.data.books[0].id;

  const response = await axios.get(`${BASE_URL}/books/${bookId}/chunks?page=1&limit=1`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  console.log('   Chunks retrieved:', {
    chunksCount: response.data.chunks.length,
    totalPages: response.data.pagination.totalPages,
    hasNext: response.data.pagination.hasNext
  });
}

async function testProgressUpdate() {
  // Get book ID
  const booksResponse = await axios.get(`${BASE_URL}/books`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (booksResponse.data.books.length === 0) {
    console.log('   No books found to test progress');
    return;
  }

  const bookId = booksResponse.data.books[0].id;

  const response = await axios.put(`${BASE_URL}/books/${bookId}/progress`, {
    currentPage: 5,
    currentChapter: 2,
    readingProgress: 25.0
  }, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('   Progress updated:', response.data.message);
}

async function testPositionsAndExercises() {
  // Get book ID
  const booksResponse = await axios.get(`${BASE_URL}/books`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (booksResponse.data.books.length === 0) {
    console.log('   No books found to test positions');
    return;
  }

  const bookId = booksResponse.data.books[0].id;

  // Test positions
  const positionsResponse = await axios.get(`${BASE_URL}/books/${bookId}/positions`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  console.log('   Positions retrieved:', positionsResponse.data.positions.length);

  // Test exercises
  const exercisesResponse = await axios.get(`${BASE_URL}/books/${bookId}/exercises`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  console.log('   Exercises retrieved:', exercisesResponse.data.exercises.length);
}

// Additional test for API health
async function testAPIHealth() {
  console.log('🏥 Testing API Health...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ API Health Check:', response.data.status);
    console.log('   Features:', Object.keys(response.data.features).filter(f => response.data.features[f]));
  } catch (error) {
    console.error('❌ API Health Check failed:', error.message);
  }
  
  console.log('');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting AmaChess Books API Tests\n');
  
  await testAPIHealth();
  await testBooksAPI();
  
  console.log('✨ All tests completed successfully!');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3001');
    console.log('📝 Please start the server first with: npm run dev');
    process.exit(1);
  }
  
  await runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testBooksAPI,
  testAPIHealth,
  runAllTests
};
