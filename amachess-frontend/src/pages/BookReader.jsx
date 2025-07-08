import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BookChatModal from '../components/BookChatModal';
import ChessBoard from '../components/ChessBoard';

const BookReader = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;
  
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [aiExplanation, setAIExplanation] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [engineEnabled, setEngineEnabled] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showBoardPanel, setShowBoardPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const textSelectionRef = useRef(null);

  // Sample book content with chess positions
  const bookContent = {
    title: book?.title || "Chess Fundamentals",
    author: book?.author || "Jose Capablanca",
    chapters: [
      {
        title: "Chapter 1: First Principles",
        pages: [
          {
            content: `The game of chess is played by two armies, each having sixteen pieces: one king, one queen, two rooks, two bishops, two knights, and eight pawns.

The chessboard has sixty-four squares, alternately light and dark. In setting up the board, care should be taken that each player has a light square at his right.

The pieces are placed as follows: The rooks are placed at the corners, next to them the knights, then the bishops. The queen is placed on her own color (white queen on white square, black queen on black square), and the king on the remaining square of the first rank.

The pawns are placed on the second rank for White and on the seventh rank for Black.`,
            position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          },
          {
            content: `The object of the game is to checkmate the opponent's king. This is accomplished by attacking the king in such a way that he cannot escape capture.

When the king is attacked, he is said to be in check. The player whose king is in check must immediately get out of check by one of three methods:
1. Moving the king to a safe square
2. Blocking the attack with another piece
3. Capturing the attacking piece

If none of these options are available, the king is checkmated and the game is over.`,
            position: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3"
          }
        ]
      },
      {
        title: "Chapter 2: The Value of the Pieces",
        pages: [
          {
            content: `In chess, different pieces have different values. Understanding these values is crucial for making good exchanges and evaluating positions.

The approximate values are:
- Pawn = 1 point
- Knight = 3 points  
- Bishop = 3 points
- Rook = 5 points
- Queen = 9 points
- King = invaluable (cannot be captured)

These values are not absolute and can change based on the position. For instance, in endgames, pawns become more valuable as they can promote to queens.`,
            position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
          }
        ]
      }
    ]
  };

  const practicePositions = [
    {
      id: 1,
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      question: "White to move. What is the best continuation?",
      solution: "Ng5",
      explanation: "Attacking the f7 square, which is a common weakness in Black's position."
    },
    {
      id: 2,
      fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3",
      question: "How should White continue the development?",
      solution: "d3",
      explanation: "Supporting the e4 pawn and preparing to develop the bishop."
    },
    {
      id: 3,
      fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 6",
      question: "Black has developed actively. What should White do?",
      solution: "Bg5",
      explanation: "Pinning the knight and creating pressure on Black's position."
    }
  ];

  const [practiceState, setPracticeState] = useState({
    currentPuzzle: 0,
    isTimedMode: false,
    isStreakMode: false,
    timePerPuzzle: 60,
    score: 0,
    mistakes: [],
    completed: false
  });

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setSelectedText(selection.toString());
    }
  };

  const clearTextSelection = () => {
    setSelectedText('');
    window.getSelection().removeAllRanges();
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
      page: currentPage,
      chapter: currentChapter,
      timestamp: new Date().toLocaleString()
    };
    setNotes([...notes, note]);
    setNewNote('');
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const nextPage = () => {
    const chapter = bookContent.chapters[currentChapter];
    if (currentPage < chapter.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setCurrentPosition(chapter.pages[currentPage + 1].position);
    } else if (currentChapter < bookContent.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
      setCurrentPosition(bookContent.chapters[currentChapter + 1].pages[0].position);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setCurrentPosition(bookContent.chapters[currentChapter].pages[currentPage - 1].position);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      const prevChapter = bookContent.chapters[currentChapter - 1];
      setCurrentPage(prevChapter.pages.length - 1);
      setCurrentPosition(prevChapter.pages[prevChapter.pages.length - 1].position);
    }
  };

  const startPracticeMode = (isTimedMode, isStreakMode, timeLimit = 60) => {
    setPracticeState({
      currentPuzzle: 0,
      isTimedMode,
      isStreakMode,
      timePerPuzzle: timeLimit,
      score: 0,
      mistakes: [],
      completed: false
    });
    setShowPracticeModal(true);
  };

  const solvePuzzle = (answer) => {
    const currentPuzzle = practicePositions[practiceState.currentPuzzle];
    const isCorrect = answer.toLowerCase() === currentPuzzle.solution.toLowerCase();
    
    if (isCorrect) {
      setPracticeState(prev => ({
        ...prev,
        score: prev.score + 1,
        currentPuzzle: prev.currentPuzzle + 1
      }));
    } else {
      setPracticeState(prev => ({
        ...prev,
        mistakes: [...prev.mistakes, { puzzle: currentPuzzle, userAnswer: answer }],
        currentPuzzle: prev.isStreakMode ? 0 : prev.currentPuzzle + 1
      }));
    }

    if (practiceState.currentPuzzle >= practicePositions.length - 1) {
      setPracticeState(prev => ({ ...prev, completed: true }));
    }
  };

  // Authentication check
  useEffect(() => {
    // In a real app, you'd check for actual authentication token/session
    // For this demo, we'll simulate checking if user is "logged in"
    const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true' || 
                           document.referrer.includes('/dashboard') ||
                           document.referrer.includes('/library');
    
    if (!isAuthenticated) {
      // Redirect to homepage if not authenticated
      navigate('/');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (bookContent.chapters[currentChapter]?.pages[currentPage]?.position) {
      setCurrentPosition(bookContent.chapters[currentChapter].pages[currentPage].position);
    }
  }, [currentChapter, currentPage]);

  if (!book) {
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

  const currentChapterData = bookContent.chapters[currentChapter];
  const currentPageData = currentChapterData.pages[currentPage];

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
                <h1 className="text-lg font-bold text-white truncate">{bookContent.title}</h1>
                <p className="text-[#97a1c4] text-sm truncate">by {bookContent.author}</p>
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
              <select 
                value={currentChapter}
                onChange={(e) => {
                  setCurrentChapter(parseInt(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-[#374162] text-white rounded-lg px-2 py-1 text-sm focus:outline-none flex-shrink-0"
              >
                {bookContent.chapters.map((chapter, index) => (
                  <option key={index} value={index}>Ch. {index + 1}</option>
                ))}
              </select>
              
              <span className="text-[#97a1c4] text-sm whitespace-nowrap">
                Page {currentPage + 1}/{currentChapterData.pages.length}
              </span>
              
              <button
                onClick={() => setShowBoardPanel(true)}
                className="ml-auto px-3 py-1 bg-blue-800 text-white rounded-lg text-sm flex-shrink-0"
              >
                Board
              </button>
              
              <button
                onClick={() => setShowChatModal(true)}
                className="px-3 py-1 bg-purple-800 text-white rounded-lg text-sm flex-shrink-0"
              >
                AI
              </button>
              
              <button
                onClick={() => setShowNotesPanel(!showNotesPanel)}
                className="px-3 py-1 bg-[#374162] text-white rounded-lg text-sm flex-shrink-0"
              >
                Notes
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-hidden">
            {showNotesPanel ? (
              // Mobile Notes Panel
              <div className="h-full flex flex-col bg-[#1a1f2e]">
                <div className="p-4 border-b border-[#374162]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">Notes</h3>
                    <button
                      onClick={() => setShowNotesPanel(false)}
                      className="text-[#97a1c4] hover:text-white p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 focus:outline-none resize-none text-sm"
                      rows={3}
                    />
                    <button
                      onClick={addNote}
                      className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {notes.filter(note => note.chapter === currentChapter).map((note) => (
                      <div key={note.id} className="bg-[#374162] rounded-lg p-3">
                        <p className="text-white text-sm mb-2">{note.text}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-[#97a1c4] text-xs">Page {note.page + 1} • {note.timestamp}</p>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Mobile Text Content
              <div className="h-full overflow-y-auto p-4">
                <div 
                  ref={textSelectionRef}
                  onMouseUp={handleTextSelection}
                  className="prose prose-invert max-w-none"
                >
                  <h2 className="text-lg font-bold text-white mb-4">{currentChapterData.title}</h2>
                  <div className="text-[#e1e5e9] leading-relaxed whitespace-pre-line text-base">
                    {currentPageData.content}
                  </div>
                </div>

                {/* Mobile Page Navigation */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#374162] sticky bottom-0 bg-[#121621]">
                  <button
                    onClick={prevPage}
                    disabled={currentChapter === 0 && currentPage === 0}
                    className="flex items-center gap-2 px-3 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentChapter === bookContent.chapters.length - 1 && currentPage === currentChapterData.pages.length - 1}
                    className="flex items-center gap-2 px-3 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Board Modal */}
          {showBoardPanel && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#121621] rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#374162]">
                  <h3 className="text-lg font-bold text-white">Position</h3>
                  <button
                    onClick={() => setShowBoardPanel(false)}
                    className="text-[#97a1c4] hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4">
                  <ChessBoard 
                    position={currentPosition}
                    engineEnabled={engineEnabled}
                    interactive={true}
                    width={280}
                  />
                  
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setEngineEnabled(!engineEnabled)}
                      className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                        engineEnabled ? 'bg-green-800 text-white' : 'bg-[#374162] text-[#97a1c4]'
                      }`}
                    >
                      Engine {engineEnabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => startPracticeMode(false, false)}
                      className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Practice Mode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Desktop Layout
        <div className="flex h-[calc(100vh-80px)]">
          {/* Desktop Left Panel - Book Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Desktop Book Header */}
            <div className="bg-[#1a1f2e] border-b border-[#374162] p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-white truncate">{bookContent.title}</h1>
                  <p className="text-[#97a1c4] truncate">by {bookContent.author}</p>
                </div>
                <div className="flex gap-2 lg:gap-3 ml-4">
                  <button
                    onClick={() => setShowNotesPanel(!showNotesPanel)}
                    className="px-3 lg:px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors text-sm lg:text-base"
                  >
                    Notes ({notes.length})
                  </button>
                  <button
                    onClick={() => setShowChatModal(true)}
                    className="px-3 lg:px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                  >
                    Ask AI Coach
                  </button>
                  <button
                    onClick={() => navigate('/library')}
                    className="px-3 lg:px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors text-sm lg:text-base"
                  >
                    Back to Library
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Chapter Navigation */}
            <div className="bg-[#1a1f2e] border-b border-[#374162] px-4 lg:px-6 py-3">
              <div className="flex items-center gap-4">
                <select 
                  value={currentChapter}
                  onChange={(e) => {
                    setCurrentChapter(parseInt(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="bg-[#374162] text-white rounded-lg px-3 py-2 focus:outline-none text-sm lg:text-base"
                >
                  {bookContent.chapters.map((chapter, index) => (
                    <option key={index} value={index}>{chapter.title}</option>
                  ))}
                </select>
                <span className="text-[#97a1c4] text-sm lg:text-base">
                  Page {currentPage + 1} of {currentChapterData.pages.length}
                </span>
              </div>
            </div>

            {/* Desktop Main Content */}
            <div className="flex-1 flex min-h-0">
              {/* Desktop Text Content */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                <div 
                  ref={textSelectionRef}
                  onMouseUp={handleTextSelection}
                  className="prose prose-invert max-w-none"
                >
                  <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">{currentChapterData.title}</h2>
                  <div className="text-[#e1e5e9] leading-relaxed whitespace-pre-line text-base lg:text-lg">
                    {currentPageData.content}
                  </div>
                </div>

                {/* Desktop Text Selection Actions */}
                {selectedText && (
                  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#1a1f2e] border border-[#374162] rounded-lg p-4 shadow-lg z-40 max-w-md w-full mx-4">
                    <p className="text-sm text-[#97a1c4] mb-3 truncate">Selected: "{selectedText}"</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={handleAIExplanation}
                        className="px-3 lg:px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Ask AI to Explain
                      </button>
                      <button
                        onClick={() => setShowChatModal(true)}
                        className="px-3 lg:px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Discuss with Coach
                      </button>
                      <button
                        onClick={clearTextSelection}
                        className="px-3 lg:px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Desktop Page Navigation */}
                <div className="flex justify-between items-center mt-6 lg:mt-8 pt-4 border-t border-[#374162]">
                  <button
                    onClick={prevPage}
                    disabled={currentChapter === 0 && currentPage === 0}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentChapter === bookContent.chapters.length - 1 && currentPage === currentChapterData.pages.length - 1}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Desktop Notes Panel */}
              {showNotesPanel && (
                <div className="w-72 lg:w-80 bg-[#1a1f2e] border-l border-[#374162] flex flex-col">
                  <div className="p-4 border-b border-[#374162]">
                    <h3 className="text-base lg:text-lg font-bold text-white mb-3">Notes</h3>
                    <div className="space-y-2">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 focus:outline-none resize-none text-sm"
                        rows={3}
                      />
                      <button
                        onClick={addNote}
                        className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {notes.filter(note => note.chapter === currentChapter).map((note) => (
                        <div key={note.id} className="bg-[#374162] rounded-lg p-3">
                          <p className="text-white text-sm mb-2">{note.text}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-[#97a1c4] text-xs">Page {note.page + 1} • {note.timestamp}</p>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Panel - Chess Board */}
          <div className="w-80 lg:w-96 bg-[#1a1f2e] border-l border-[#374162] flex flex-col">
            <div className="p-4 border-b border-[#374162]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base lg:text-lg font-bold text-white">Position</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEngineEnabled(!engineEnabled)}
                    className={`px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-colors ${
                      engineEnabled ? 'bg-green-800 text-white' : 'bg-[#374162] text-[#97a1c4]'
                    }`}
                  >
                    Engine {engineEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Chess Board */}
            <div className="flex-1 p-4 overflow-y-auto">
              <ChessBoard 
                position={currentPosition}
                engineEnabled={engineEnabled}
                interactive={true}
              />

              {/* Desktop Practice Positions Section */}
              <div className="mt-4 lg:mt-6">
                <h4 className="text-white font-semibold mb-3 text-sm lg:text-base">Practice All Positions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => startPracticeMode(false, false)}
                    className="w-full px-3 lg:px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm"
                  >
                    Practice Mode
                  </button>
                  <button
                    onClick={() => startPracticeMode(true, false, 60)}
                    className="w-full px-3 lg:px-4 py-2 bg-orange-800 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs lg:text-sm"
                  >
                    Timed Practice (60s)
                  </button>
                  <button
                    onClick={() => startPracticeMode(false, true)}
                    className="w-full px-3 lg:px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs lg:text-sm"
                  >
                    Streak Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation Modal - Responsive */}
      {showAIExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121621] rounded-xl max-w-2xl w-full p-4 lg:p-6 border border-[#374162] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-white">AI Explanation</h3>
              <button
                onClick={() => setShowAIExplanation(false)}
                className="text-[#97a1c4] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-[#97a1c4] text-sm mb-2">Selected text:</p>
              <p className="text-white bg-[#374162] rounded-lg p-3 text-sm break-words">"{selectedText}"</p>
            </div>
            
            <div>
              <p className="text-[#97a1c4] text-sm mb-2">AI Explanation:</p>
              <p className="text-white bg-[#1a1f2e] rounded-lg p-4 leading-relaxed text-sm lg:text-base">
                {aiExplanation || "Loading explanation..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal - Responsive */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#121621] rounded-xl w-full max-w-6xl h-[95vh] sm:h-[80vh] border border-[#374162] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#374162]">
              <div>
                <h3 className="text-xl font-bold text-white">Practice Mode</h3>
                <p className="text-[#97a1c4]">
                  Puzzle {practiceState.currentPuzzle + 1} of {practicePositions.length} • Score: {practiceState.score}
                </p>
              </div>
              <button
                onClick={() => setShowPracticeModal(false)}
                className="text-[#97a1c4] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!practiceState.completed ? (
              <div className="flex-1 flex">
                {/* Practice Board */}
                <div className="flex-1 p-6">
                  <div className="w-full max-w-md mx-auto">
                    <h4 className="text-white font-bold text-lg mb-4 text-center">
                      {practicePositions[practiceState.currentPuzzle]?.question}
                    </h4>
                    <ChessBoard 
                      position={practicePositions[practiceState.currentPuzzle]?.fen}
                      engineEnabled={false}
                      interactive={true}
                      onMove={(from, to) => {
                        // Handle practice move
                        console.log('Practice move:', from, to);
                      }}
                    />
                  </div>
                </div>

                {/* Practice Controls */}
                <div className="w-80 bg-[#1a1f2e] border-l border-[#374162] p-6">
                  <h4 className="text-white font-semibold mb-4">Your Move</h4>
                  <input
                    type="text"
                    placeholder="Enter your move (e.g., Nf3)"
                    className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 mb-4 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        solvePuzzle(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  
                  {practiceState.isTimedMode && (
                    <div className="mb-4">
                      <p className="text-[#97a1c4] text-sm">Time remaining: {practiceState.timePerPuzzle}s</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowChatModal(true)}
                    className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
                  >
                    Get AI Hint
                  </button>

                  {practiceState.mistakes.length > 0 && (
                    <div>
                      <h5 className="text-white font-semibold mb-2">Mistakes:</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {practiceState.mistakes.map((mistake, index) => (
                          <div key={index} className="bg-[#374162] rounded-lg p-2 text-sm">
                            <p className="text-red-400">Your answer: {mistake.userAnswer}</p>
                            <p className="text-green-400">Correct: {mistake.puzzle.solution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Practice Complete!</h3>
                  <p className="text-[#97a1c4] mb-6">
                    Score: {practiceState.score}/{practicePositions.length} • 
                    Mistakes: {practiceState.mistakes.length}
                  </p>
                  
                  {practiceState.mistakes.length > 0 && (
                    <button
                      onClick={() => setPracticeState(prev => ({ ...prev, completed: false, currentPuzzle: 0 }))}
                      className="px-6 py-3 bg-orange-800 text-white rounded-lg hover:bg-orange-700 transition-colors mr-4"
                    >
                      Review Mistakes
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowPracticeModal(false)}
                    className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Reading
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <BookChatModal 
          onClose={() => setShowChatModal(false)}
          book={book}
          currentChapter={currentChapter}
          currentPage={currentPage}
          selectedText={selectedText}
        />
      )}
    </div>
  );
};

export default BookReader;
