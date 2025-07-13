import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BookChatModal from '../components/BookChatModal';
import ChessGame from '../components/ChessGame';
import PDFViewer from '../components/PDFViewer';
import { booksApiService, BookChunk, ChessPosition, ChessExercise } from '../services/booksApi';

const BookReader = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookFromState = location.state?.book;
  
  const [book, setBook] = useState(bookFromState);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [bookChunks, setBookChunks] = useState<BookChunk[]>([]);
  const [chessPositions, setChessPositions] = useState<ChessPosition[]>([]);
  const [exercises, setExercises] = useState<ChessExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [aiExplanation, setAIExplanation] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<string | null>(null);
  const [engineEnabled, setEngineEnabled] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showBoardPanel, setShowBoardPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hasPDF, setHasPDF] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);

  // Load book content from backend
  useEffect(() => {
    const loadBookContent = async () => {
      if (!bookId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load book info if not passed via state
        if (!book) {
          const bookData = await booksApiService.getBook(bookId);
          setBook(bookData);
        }
        
        // Load book chunks
        const chunksResponse = await booksApiService.getBookChunks(bookId, 1, 20);
        setBookChunks(chunksResponse.chunks);
        
        // Load chess positions
        const positions = await booksApiService.getBookPositions(bookId);
        setChessPositions(positions);
        
        // Load exercises
        const exercisesList = await booksApiService.getBookExercises(bookId);
        setExercises(exercisesList);
        
        // Check if PDF is available
        const pdfAvailable = await booksApiService.hasPDFFile(bookId);
        setHasPDF(pdfAvailable);
        
        if (pdfAvailable) {
          const pdfFileUrl = await booksApiService.getPDFUrl(bookId);
          setPdfUrl(pdfFileUrl);
        }
        
        // Set initial position if available
        if (chunksResponse.chunks.length > 0 && positions.length > 0) {
          const firstPosition = positions.find(p => p.isValid);
          if (firstPosition) {
            setCurrentPosition(firstPosition.fen);
          }
        }
      } catch (err) {
        console.error('Failed to load book content:', err);
        setError('Failed to load book content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBookContent();
  }, [bookId, book]);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true' ||
                            document.referrer.includes('/dashboard') ||
                           document.referrer.includes('/library');
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection?.toString().length && selection.toString().length > 0) {
      setSelectedText(selection.toString());
    }
  };

  const clearTextSelection = () => {
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  const handleAIExplanation = async () => {
    if (!selectedText) return;
    
    setShowAIExplanation(true);
    // Simulate AI response
    setTimeout(() => {
      setAIExplanation(`Here's a simpler explanation of "${selectedText}": This concept refers to the fundamental principles that every chess player should understand. Think of it as the basic rules that guide your decision-making during a game.`);
    }, 1000);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      text: newNote,
      chunk: currentChunk,
      timestamp: new Date().toLocaleString()
    };
    setNotes([...notes, note]);
    setNewNote('');
  };

  const deleteNote = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const nextChunk = () => {
    if (currentChunk < bookChunks.length - 1) {
      const nextIndex = currentChunk + 1;
      setCurrentChunk(nextIndex);
      // Update position if the chunk has chess positions
      const chunk = bookChunks[nextIndex];
      if (chunk && chunk.positions && chunk.positions.length > 0 && chunk.positions[0]) {
        setCurrentPosition(chunk.positions[0].fen);
      }
    }
  };

  const prevChunk = () => {
    if (currentChunk > 0) {
      const prevIndex = currentChunk - 1;
      setCurrentChunk(prevIndex);
      // Update position if the chunk has chess positions
      const chunk = bookChunks[prevIndex];
      if (chunk && chunk.positions && chunk.positions.length > 0 && chunk.positions[0]) {
        setCurrentPosition(chunk.positions[0].fen);
      }
    }
  };

  const handlePDFPageChange = (page: number) => {
    setPdfPage(page);
    // Optionally sync with text chunks if there's a mapping
  };

  const syncPDFWithText = () => {
    // Logic to sync PDF page with current text chunk
    // This could be based on page mapping or content correlation
    const estimatedPage = Math.ceil((currentChunk + 1) * (100 / bookChunks.length)); // Simple estimation
    setPdfPage(estimatedPage);
  };

  if (!book && !loading) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Book not found</h2>
          <button 
            onClick={() => navigate('/library')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Loading book content...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">{error}</h2>
          <button 
            onClick={() => navigate('/library')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  const currentChunkData = bookChunks[currentChunk];

  return (
    <div className="min-h-screen bg-[#121621] text-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <Header />
      
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Mobile Book Header */}
          <div className="bg-[#1a1f2e] border-b border-[#374162] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-white truncate">{book?.title || 'Unknown Book'}</h1>
                <p className="text-[#97a1c4] text-sm truncate">by {book?.author || 'Unknown Author'}</p>
              </div>
              <button
                onClick={() => navigate('/library')}
                className="ml-3 p-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* View Mode Toggle */}
              {hasPDF && (
                <div className="flex bg-[#374162] rounded-lg p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      viewMode === 'text' 
                        ? 'bg-blue-800 text-white' 
                        : 'text-[#97a1c4] hover:text-white'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setViewMode('pdf')}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      viewMode === 'pdf' 
                        ? 'bg-blue-800 text-white' 
                        : 'text-[#97a1c4] hover:text-white'
                    }`}
                  >
                    PDF
                  </button>
                </div>
              )}
              
              {viewMode === 'text' && (
                <>
                  <select 
                    value={currentChunk}
                    onChange={(e) => setCurrentChunk(parseInt(e.target.value))}
                    className="bg-[#374162] text-white rounded-lg px-2 py-1 text-sm focus:outline-none flex-shrink-0"
                  >
                    {bookChunks.map((chunk, index) => (
                      <option key={chunk.id} value={index}>
                        {chunk.chapterTitle || `Chunk ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={prevChunk}
                      disabled={currentChunk === 0}
                      className="p-1 bg-[#374162] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs text-[#97a1c4] px-2 flex-shrink-0">
                      {currentChunk + 1} / {bookChunks.length}
                    </span>
                    <button
                      onClick={nextChunk}
                      disabled={currentChunk === bookChunks.length - 1}
                      className="p-1 bg-[#374162] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
              
              <button
                onClick={() => setShowBoardPanel(!showBoardPanel)}
                className="p-1 bg-blue-800 text-white rounded text-xs px-2 flex-shrink-0"
              >
                Board
              </button>
            </div>
          </div>
          
          {/* Mobile Content */}
          <div className="flex-1 overflow-hidden">
            {showBoardPanel ? (
              <div className="h-full p-4">
                <div className="bg-[#1a1f2e] rounded-lg p-4 h-full">
                  {currentPosition && <ChessGame />}
                </div>
              </div>
            ) : viewMode === 'pdf' && hasPDF && pdfUrl ? (
              <PDFViewer 
                pdfUrl={pdfUrl} 
                onPageChange={handlePDFPageChange}
                initialPage={pdfPage}
                className="h-full"
              />
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <h2 className="text-lg font-bold mb-4">{currentChunkData?.chapterTitle || 'Content'}</h2>
                  <div
                    className="prose prose-invert max-w-none text-sm leading-relaxed"
                    onMouseUp={handleTextSelection}
                    dangerouslySetInnerHTML={{
                      __html: currentChunkData?.content?.replace(/\n/g, '<br/>') || 'No content available'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Book Navigation */}
          <div className="w-80 bg-[#1a1f2e] border-r border-[#374162] flex flex-col">
            {/* Book Header */}
            <div className="p-6 border-b border-[#374162]">
              <h1 className="text-xl font-bold text-white mb-2">{book?.title || 'Unknown Book'}</h1>
              <p className="text-[#97a1c4] text-sm">by {book?.author || 'Unknown Author'}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#97a1c4]">
                <span>{bookChunks.length} chunks</span>
                <span>{chessPositions.length} positions</span>
                <span>{exercises.length} exercises</span>
              </div>
              
              {/* View Mode Toggle */}
              {hasPDF && (
                <div className="mt-4">
                  <div className="flex bg-[#374162] rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('text')}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                        viewMode === 'text' 
                          ? 'bg-blue-800 text-white' 
                          : 'text-[#97a1c4] hover:text-white'
                      }`}
                    >
                      Text View
                    </button>
                    <button
                      onClick={() => setViewMode('pdf')}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                        viewMode === 'pdf' 
                          ? 'bg-blue-800 text-white' 
                          : 'text-[#97a1c4] hover:text-white'
                      }`}
                    >
                      PDF View
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chunk Navigation - only show in text mode */}
            {viewMode === 'text' && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Content</h3>
                  <div className="space-y-2">
                    {bookChunks.map((chunk, index) => (
                      <button
                        key={chunk.id}
                        onClick={() => setCurrentChunk(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentChunk === index
                            ? 'bg-blue-800 text-white'
                            : 'bg-[#272e45] text-[#97a1c4] hover:bg-[#374162] hover:text-white'
                        }`}
                      >
                        <div className="text-sm font-medium">{chunk.chapterTitle || `Chunk ${index + 1}`}</div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          {chunk.hasChessContent && (
                            <span className="bg-green-600 px-2 py-1 rounded">Chess Content</span>
                          )}
                          {chunk.exercises && chunk.exercises.length > 0 && (
                            <span className="bg-orange-600 px-2 py-1 rounded">Exercise</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* PDF Info - show in PDF mode */}
            {viewMode === 'pdf' && hasPDF && (
              <div className="flex-1 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">PDF Information</h3>
                <div className="bg-[#272e45] rounded-lg p-4 text-sm text-[#97a1c4]">
                  <div className="mb-2">
                    <span className="font-medium">Current Page:</span> {pdfPage}
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">File:</span> {book?.originalFileName || 'book.pdf'}
                  </div>
                  
                  {bookChunks.length > 0 && (
                    <button
                      onClick={syncPDFWithText}
                      className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Sync with Text
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Practice Mode Button */}
            {exercises.length > 0 && (
              <div className="p-4 border-t border-[#374162]">
                <button
                  onClick={() => setShowPracticeModal(true)}
                  className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Practice Exercises ({exercises.length})
                </button>
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Book Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'pdf' && hasPDF && pdfUrl ? (
                <PDFViewer 
                  pdfUrl={pdfUrl} 
                  onPageChange={handlePDFPageChange}
                  initialPage={pdfPage}
                  className="h-full"
                />
              ) : (
                <div className="h-full overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={prevChunk}
                          disabled={currentChunk === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                        <span className="text-[#97a1c4] text-sm">
                          {currentChunk + 1} / {bookChunks.length}
                        </span>
                        <button
                          onClick={nextChunk}
                          disabled={currentChunk === bookChunks.length - 1}
                          className="flex items-center gap-2 px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Next
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => navigate('/library')}
                        className="px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors text-sm"
                      >
                        Back to Library
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-[#1a1f2e] rounded-lg p-8">
                      <h2 className="text-2xl font-bold text-white mb-6">
                        {currentChunkData?.chapterTitle || 'Content'}
                      </h2>
                      
                      <div
                        className="prose prose-invert prose-lg max-w-none leading-relaxed"
                        onMouseUp={handleTextSelection}
                      >
                        {currentChunkData?.content ? (
                          // Check if content is a fallback message
                          currentChunkData.content.includes('Text Extraction Issue') ? (
                            <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6">
                              <div
                                className="text-orange-100 space-y-4"
                                dangerouslySetInnerHTML={{
                                  __html: currentChunkData.content
                                    .replace(/^# /gm, '<h1 class="text-2xl font-bold text-orange-400 mb-4">')
                                    .replace(/^## /gm, '<h2 class="text-xl font-semibold text-orange-300 mt-6 mb-3">')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-200">$1</strong>')
                                    .replace(/`([^`]+)`/g, '<code class="bg-black/30 px-2 py-1 rounded text-orange-200">$1</code>')
                                    .replace(/```[\s\S]*?```/g, (match) => {
                                      const content = match.replace(/```/g, '');
                                      return `<pre class="bg-black/50 p-4 rounded mt-4 text-orange-200 text-sm overflow-x-auto"><code>${content}</code></pre>`;
                                    })
                                    .replace(/\n/g, '<br/>')
                                }}
                              />
                            </div>
                          ) : (
                            // Check if content looks corrupted
                            /[^\x20-\x7E\n\r\t]/.test(currentChunkData.content) && 
                            (currentChunkData.content.match(/[^\x20-\x7E\n\r\t]/g) || []).length > currentChunkData.content.length * 0.1 ? (
                              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
                                <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Text Extraction Issue</h3>
                                <p className="text-yellow-200 text-sm mb-3">
                                  This PDF appears to have encoding issues that prevent proper text extraction. 
                                  The content may be from a scanned document or use non-standard fonts.
                                </p>
                                <details className="text-xs text-gray-400">
                                  <summary className="cursor-pointer hover:text-gray-300">Show raw content</summary>
                                  <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs break-all">
                                    {currentChunkData.content.substring(0, 500)}
                                    {currentChunkData.content.length > 500 && '...'}
                                  </div>
                                </details>
                              </div>
                            ) : (
                              <div dangerouslySetInnerHTML={{
                                __html: currentChunkData.content.replace(/\n/g, '<br/><br/>')
                              }} />
                            )
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <p>No content available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Chess Content Summary */}
                      {currentChunkData?.chessContentSummary && (
                        <div className="mt-8 p-4 bg-[#272e45] rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Chess Content</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#97a1c4]">
                            <div>Positions: {currentChunkData.chessContentSummary.positionCount}</div>
                            <div>Diagrams: {currentChunkData.chessContentSummary.diagramCount}</div>
                            <div>Exercises: {currentChunkData.chessContentSummary.exerciseCount}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Sidebar - Chess Board */}
            <div className="w-96 bg-[#1a1f2e] border-l border-[#374162] p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Chess Board</h3>
                  {currentPosition ? (
                    <ChessGame />
                  ) : (
                    <div className="aspect-square bg-[#272e45] rounded-lg flex items-center justify-center">
                      <p className="text-[#97a1c4] text-sm">No position available</p>
                    </div>
                  )}
                </div>
                
                {/* Position Controls */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowChatModal(true)}
                    className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Chat with Book
                  </button>
                  
                  <button
                    onClick={() => setEngineEnabled(!engineEnabled)}
                    className={`w-full py-3 rounded-lg transition-colors text-sm font-medium ${
                      engineEnabled
                        ? 'bg-green-800 text-white hover:bg-green-700'
                        : 'bg-[#374162] text-white hover:bg-[#455173]'
                    }`}
                  >
                    {engineEnabled ? 'Engine On' : 'Engine Off'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showChatModal && (
        <BookChatModal
          book={book}
          currentChapter={currentChunk}
          currentPage={currentChunk + 1}
          selectedText={selectedText}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Text Selection Actions */}
      {selectedText && (
        <div className="fixed bottom-4 right-4 bg-[#1a1f2e] border border-[#374162] rounded-lg p-4 z-50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAIExplanation}
              className="px-3 py-2 bg-blue-800 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Explain
            </button>
            <button
              onClick={clearTextSelection}
              className="px-3 py-2 bg-[#374162] text-white rounded text-sm hover:bg-[#455173] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {showAIExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121621] rounded-xl max-w-lg w-full p-6 border border-[#374162]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">AI Explanation</h3>
              <button
                onClick={() => setShowAIExplanation(false)}
                className="text-[#97a1c4] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-[#97a1c4] leading-relaxed">
              {aiExplanation || 'Generating explanation...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookReader;