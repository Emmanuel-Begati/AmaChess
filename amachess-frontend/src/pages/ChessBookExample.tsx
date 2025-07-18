import React, { useState } from 'react';
import ChessBookReader from '../components/ChessBookReader';

const ChessBookExample = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [showReader, setShowReader] = useState(false);

  // Example PDF URLs for testing
  const exampleBooks = [
    {
      title: "Chess Fundamentals",
      url: "http://localhost:3001/api/books/1/pdf",
      description: "Classic chess instruction by José Capablanca"
    },
    {
      title: "My System",
      url: "http://localhost:3001/api/books/2/pdf", 
      description: "Revolutionary chess strategy by Aron Nimzowitsch"
    },
    {
      title: "Dvoretsky's Endgame Manual",
      url: "http://localhost:3001/api/books/3/pdf",
      description: "Comprehensive endgame study by Mark Dvoretsky"
    }
  ];

  const handleLoadBook = (book: typeof exampleBooks[0]) => {
    setPdfUrl(book.url);
    setBookTitle(book.title);
    setShowReader(true);
  };

  const handleCustomUrl = () => {
    if (pdfUrl.trim()) {
      setShowReader(true);
    }
  };

  if (showReader) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Chess Book Reader</h1>
            <button
              onClick={() => setShowReader(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Library
            </button>
          </div>
        </div>

        {/* Chess Book Reader */}
        <div className="flex-1">
          <ChessBookReader
            pdfUrl={pdfUrl}
            bookTitle={bookTitle}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Interactive Chess Book Reader
          </h1>
          <p className="text-lg text-gray-600">
            Select a chess book to start reading with interactive diagram detection
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-blue-600 text-2xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Automatic Detection
            </h3>
            <p className="text-gray-600">
              AI-powered detection of chess diagrams in PDF pages
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-green-600 text-2xl mb-3">♟️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Interactive Board
            </h3>
            <p className="text-gray-600">
              Click on detected diagrams to load positions onto an interactive board
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-purple-600 text-2xl mb-3">📖</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Study Mode
            </h3>
            <p className="text-gray-600">
              Analyze positions, make moves, and study chess theory effectively
            </p>
          </div>
        </div>

        {/* Example Books */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Example Books</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleBooks.map((book, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {book.description}
                </p>
                <button
                  onClick={() => handleLoadBook(book)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Open Book
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom PDF URL */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Load Custom PDF</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF URL
              </label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="Enter PDF URL or path..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title (Optional)
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Enter book title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCustomUrl}
                disabled={!pdfUrl.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Load
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            How to Use the Chess Book Reader
          </h3>
          <ol className="text-blue-700 space-y-2">
            <li>1. Select a book from the examples above or enter a custom PDF URL</li>
            <li>2. Navigate through the PDF pages using the page controls</li>
            <li>3. Click "Detect Chess" to find chess diagrams on the current page</li>
            <li>4. Click on any highlighted bounding box to extract the chess position</li>
            <li>5. The interactive board will update with the detected position</li>
            <li>6. Use the board to analyze positions and make moves</li>
            <li>7. Copy the FEN notation to use in other chess applications</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ChessBookExample;
