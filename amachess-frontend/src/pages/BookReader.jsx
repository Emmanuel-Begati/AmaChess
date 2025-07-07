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
      <div className="min-h-screen bg-[#121621] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Book not found</h2>
          <button 
            onClick={() => navigate('/library')}
            className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Book Content */}
        <div className="flex-1 flex flex-col">
          {/* Book Header */}
          <div className="bg-[#1a1f2e] border-b border-[#374162] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{bookContent.title}</h1>
                <p className="text-[#97a1c4]">by {bookContent.author}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNotesPanel(!showNotesPanel)}
                  className="px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors"
                >
                  Notes ({notes.length})
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ask AI Coach
                </button>
                <button
                  onClick={() => navigate('/library')}
                  className="px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors"
                >
                  Back to Library
                </button>
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="bg-[#1a1f2e] border-b border-[#374162] px-6 py-3">
            <div className="flex items-center gap-4">
              <select 
                value={currentChapter}
                onChange={(e) => {
                  setCurrentChapter(parseInt(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-[#374162] text-white rounded-lg px-3 py-2 focus:outline-none"
              >
                {bookContent.chapters.map((chapter, index) => (
                  <option key={index} value={index}>{chapter.title}</option>
                ))}
              </select>
              <span className="text-[#97a1c4]">
                Page {currentPage + 1} of {currentChapterData.pages.length}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Text Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div 
                ref={textSelectionRef}
                onMouseUp={handleTextSelection}
                className="prose prose-invert max-w-none"
              >
                <h2 className="text-xl font-bold text-white mb-6">{currentChapterData.title}</h2>
                <div className="text-[#e1e5e9] leading-relaxed whitespace-pre-line text-lg">
                  {currentPageData.content}
                </div>
              </div>

              {/* Text Selection Actions */}
              {selectedText && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#1a1f2e] border border-[#374162] rounded-lg p-4 shadow-lg z-40">
                  <p className="text-sm text-[#97a1c4] mb-3">Selected: "{selectedText}"</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAIExplanation}
                      className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Ask AI to Explain
                    </button>
                    <button
                      onClick={() => setShowChatModal(true)}
                      className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Discuss with Coach
                    </button>
                    <button
                      onClick={clearTextSelection}
                      className="px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Page Navigation */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#374162]">
                <button
                  onClick={prevPage}
                  disabled={currentChapter === 0 && currentPage === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentChapter === bookContent.chapters.length - 1 && currentPage === currentChapterData.pages.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notes Panel */}
            {showNotesPanel && (
              <div className="w-80 bg-[#1a1f2e] border-l border-[#374162] flex flex-col">
                <div className="p-4 border-b border-[#374162]">
                  <h3 className="text-lg font-bold text-white mb-3">Notes</h3>
                  <div className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 focus:outline-none resize-none"
                      rows={3}
                    />
                    <button
                      onClick={addNote}
                      className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

        {/* Right Panel - Chess Board */}
        <div className="w-96 bg-[#1a1f2e] border-l border-[#374162] flex flex-col">
          <div className="p-4 border-b border-[#374162]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Position</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEngineEnabled(!engineEnabled)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    engineEnabled ? 'bg-green-800 text-white' : 'bg-[#374162] text-[#97a1c4]'
                  }`}
                >
                  Engine {engineEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="flex-1 p-4">
            <ChessBoard 
              position={currentPosition}
              engineEnabled={engineEnabled}
              interactive={true}
              onMove={(from, to) => {
                console.log('Move attempted:', from, to);
                // Handle move logic here
              }}
            />

            {/* Practice Positions Section */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Practice All Positions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => startPracticeMode(false, false)}
                  className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Practice Mode
                </button>
                <button
                  onClick={() => startPracticeMode(true, false, 60)}
                  className="w-full px-4 py-2 bg-orange-800 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Timed Practice (60s)
                </button>
                <button
                  onClick={() => startPracticeMode(false, true)}
                  className="w-full px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Streak Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Modal */}
      {showAIExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121621] rounded-xl max-w-2xl w-full p-6 border border-[#374162]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">AI Explanation</h3>
              <button
                onClick={() => setShowAIExplanation(false)}
                className="text-[#97a1c4] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-[#97a1c4] text-sm mb-2">Selected text:</p>
              <p className="text-white bg-[#374162] rounded-lg p-3 text-sm">"{selectedText}"</p>
            </div>
            
            <div>
              <p className="text-[#97a1c4] text-sm mb-2">AI Explanation:</p>
              <p className="text-white bg-[#1a1f2e] rounded-lg p-4 leading-relaxed">
                {aiExplanation || "Loading explanation..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121621] rounded-xl max-w-4xl w-full h-[80vh] border border-[#374162] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#374162]">
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
