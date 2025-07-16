import React, { useState, useRef, useCallback } from 'react';
import ChessGame from './ChessGame';
import { Chess } from 'chess.js';

const AICoachModal = ({ onClose }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [game] = useState(() => new Chess());
  const [currentPosition, setCurrentPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [moveNumber, setMoveNumber] = useState(1);
  const [coachMessage, setCoachMessage] = useState("Welcome! Let's start with a training game. I'll guide you through important concepts as we play.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMoveHistory, setAiMoveHistory] = useState([]);
  const [difficulty, setDifficulty] = useState(5); // Default difficulty level
  const [showEvaluation, setShowEvaluation] = useState(true);

  const API_BASE_URL = 'http://localhost:3001/api';

  const handleStartGame = async () => {
    setGameStarted(true);
    setIsAnalyzing(true);
    
    try {
      // Get initial coaching advice
      const response = await fetch(`${API_BASE_URL}/stockfish/coach/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: currentPosition,
          difficulty: 'easy'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCoachMessage(`Let's begin! ${data.hint.message}`);
      } else {
        setCoachMessage("Let's begin! Start by controlling the center with moves like e4 or d4.");
      }
    } catch (error) {
      console.error('Failed to get initial coaching hint:', error);
      setCoachMessage("Let's begin! Start by controlling the center with moves like e4 or d4.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMove = useCallback(async (moveObj) => {
    console.log('Move received:', moveObj);
    
    // Create a new Chess instance with current position
    const tempGame = new Chess(currentPosition);
    
    // Try to make the move
    let moveResult;
    try {
      moveResult = tempGame.move({
        from: moveObj.from,
        to: moveObj.to,
        promotion: 'q' // Default to queen promotion
      });
    } catch (error) {
      console.error('Invalid move:', error);
      return;
    }

    if (!moveResult) {
      console.error('Move failed');
      return;
    }

    const newFen = tempGame.fen();
    console.log('Move made:', moveResult, 'New FEN:', newFen);
    
    // Update the current position
    setCurrentPosition(newFen);
    setMoveNumber(prev => prev + 1);
    setIsAnalyzing(true);

    try {
      // Get AI's response move
      const aiMoveResponse = await fetch(`${API_BASE_URL}/stockfish/coach/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: newFen,
          skillLevel: difficulty, // Use selected difficulty
          depth: 12
        })
      });

      if (aiMoveResponse.ok) {
        const aiMoveData = await aiMoveResponse.json();
        
        // Make the AI move
        const aiGame = new Chess(newFen);
        const aiMoveResult = aiGame.move(aiMoveData.coaching.suggestedMove);
        
        if (aiMoveResult) {
          // Update position after AI move with a small delay for better UX
          setTimeout(() => {
            setCurrentPosition(aiGame.fen());
          }, 1000);
          
          // Provide feedback
          const aiExplanation = aiMoveData.coaching.explanation || "I'm developing my pieces.";
          setCoachMessage(`Good move! I'll play ${aiMoveData.coaching.suggestedMove}. ${aiExplanation}`);
          
          setAiMoveHistory(prev => [...prev, {
            playerMove: moveResult.san || `${moveObj.from}-${moveObj.to}`,
            playerFeedback: "Good move!",
            aiMove: aiMoveData.coaching.suggestedMove,
            aiExplanation: aiExplanation
          }]);
        }
      } else {
        // Fallback - make a simple response
        const fallbackGame = new Chess(newFen);
        const moves = fallbackGame.moves();
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const fallbackMoveResult = fallbackGame.move(randomMove);
          
          setTimeout(() => {
            setCurrentPosition(fallbackGame.fen());
          }, 1000);
          
          setCoachMessage(`Good move! I'll play ${randomMove}. Keep developing your pieces.`);
          
          setAiMoveHistory(prev => [...prev, {
            playerMove: moveResult.san || `${moveObj.from}-${moveObj.to}`,
            playerFeedback: "Good move!",
            aiMove: randomMove,
            aiExplanation: "Keep developing your pieces."
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to get AI move:', error);
      setCoachMessage("Good move! Keep developing your pieces and thinking about piece safety.");
      
      setAiMoveHistory(prev => [...prev, {
        playerMove: moveResult.san || `${moveObj.from}-${moveObj.to}`,
        playerFeedback: "Good move! Keep developing your pieces and thinking about piece safety.",
        aiMove: "",
        aiExplanation: ""
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [API_BASE_URL, currentPosition, difficulty]);

  const getHint = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/stockfish/coach/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: currentPosition,
          difficulty: 'medium'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCoachMessage(`Hint: ${data.hint.message}`);
      } else {
        setCoachMessage("Look for the most forcing moves - checks, captures, and threats!");
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
      setCoachMessage("Look for the most forcing moves - checks, captures, and threats!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setCurrentPosition(newGame.fen());
    setGameStarted(false);
    setMoveNumber(1);
    setAiMoveHistory([]);
    setCoachMessage("Welcome! Let's start with a training game. I'll guide you through important concepts as we play.");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#121621] rounded-xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-[#374162]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">AI Chess Coach</h2>
              <p className="text-[#97a1c4] text-xs sm:text-sm">Instructive Training Game</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            {gameStarted && (
              <div className="flex items-center gap-2">
                <label htmlFor="difficulty" className="text-white text-sm hidden sm:block">Difficulty:</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  disabled={isAnalyzing}
                  className="bg-[#374162] border border-[#455173] text-white text-sm px-2 py-1 rounded focus:outline-none focus:border-blue-600 disabled:opacity-50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowEvaluation(!showEvaluation)}
                  className={`p-1.5 rounded transition-colors ${
                    showEvaluation 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#374162] text-[#97a1c4] hover:text-white'
                  }`}
                  title="Toggle Evaluation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="text-[#97a1c4] hover:text-white transition-colors p-1 sm:p-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[70vh] sm:h-[75vh] lg:h-[70vh]">
          {/* Chess Board Section */}
          <div className="flex-1 p-3 sm:p-6 lg:border-r lg:border-[#374162] min-h-0">
            <div className="bg-[#272e45] rounded-lg p-2 sm:p-4 h-full flex items-center justify-center">
              {!gameStarted ? (
                <div className="text-center px-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to Learn?</h3>
                  <p className="text-[#97a1c4] mb-4 sm:mb-6 text-sm sm:text-base">Start an instructive game with personalized coaching</p>
                  
                  {/* Pre-game difficulty selection */}
                  <div className="mb-4">
                    <label className="block text-white text-sm mb-2">Choose AI Difficulty:</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      className="bg-[#374162] border border-[#455173] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-600"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <option key={level} value={level}>
                          Level {level} {level <= 3 ? '(Beginner)' : level <= 6 ? '(Intermediate)' : '(Advanced)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    onClick={handleStartGame}
                    disabled={isAnalyzing}
                    className="bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base flex items-center gap-2 mx-auto"
                  >
                    {isAnalyzing && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isAnalyzing ? 'Initializing...' : 'Start Training Game'}
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="chessboard-modal-wrapper w-full h-full max-w-[min(100%,80vh,600px)] max-h-[min(100%,80vh,600px)] aspect-square">
                    <ChessGame
                      isModalMode={true}
                      position={currentPosition}
                      onMove={handleMove}
                      interactive={!isAnalyzing}
                      showNotation={true}
                      engineEnabled={showEvaluation}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coach Chat Section */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col min-h-0">
            {/* Coach Avatar */}
            <div className="p-3 sm:p-4 border-b border-[#374162] shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm sm:text-base">Coach Magnus</p>
                  <p className="text-green-400 text-xs">● Online {gameStarted && `• Difficulty ${difficulty}`}</p>
                </div>
                
                {/* Game Settings Display */}
                {gameStarted && (
                  <div className="text-right">
                    <p className="text-[#97a1c4] text-xs">Settings</p>
                    <p className="text-white text-xs">
                      Eval: {showEvaluation ? 'ON' : 'OFF'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#374162] rounded-lg p-2 sm:p-3">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <p className="text-white text-sm">Coach is analyzing...</p>
                    </div>
                  ) : (
                    <p className="text-white text-sm">{coachMessage}</p>
                  )}
                  <p className="text-[#97a1c4] text-xs mt-1">Coach Magnus</p>
                </div>
                
                {gameStarted && (
                  <div className="bg-blue-800 rounded-lg p-2 sm:p-3">
                    <p className="text-white text-sm">I'm ready to learn!</p>
                    <p className="text-blue-200 text-xs mt-1">You</p>
                  </div>
                )}

                {/* Display move history */}
                {aiMoveHistory.map((moveSet, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-blue-800 rounded-lg p-2 sm:p-3">
                      <p className="text-white text-sm">I played {moveSet.playerMove}</p>
                      <p className="text-blue-200 text-xs mt-1">You</p>
                    </div>
                    <div className="bg-[#374162] rounded-lg p-2 sm:p-3">
                      <p className="text-white text-sm">{moveSet.playerFeedback}</p>
                      <p className="text-[#97a1c4] text-xs mt-1">Coach Magnus</p>
                    </div>
                  </div>
                ))}

                {/* Hint Button */}
                {gameStarted && (
                  <div className="flex justify-center">
                    <button 
                      onClick={getHint}
                      disabled={isAnalyzing}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Get Hint
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="p-3 sm:p-4 border-t border-[#374162] shrink-0">
              <h4 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Today's Learning Goals</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                  <p className="text-[#97a1c4] text-xs sm:text-sm">Opening principles</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shrink-0"></div>
                  <p className="text-[#97a1c4] text-xs sm:text-sm">Tactical awareness</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full shrink-0"></div>
                  <p className="text-[#97a1c4] text-xs sm:text-sm">Endgame technique</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 p-3 sm:p-6 border-t border-[#374162]">
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="bg-green-800 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm flex-1 sm:flex-none">
              Save Progress
            </button>
            <button 
              onClick={resetGame}
              className="bg-[#374162] hover:bg-[#455173] text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Reset Game
            </button>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#374162] hover:bg-[#455173] text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoachModal;
