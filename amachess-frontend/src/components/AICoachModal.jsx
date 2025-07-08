import React, { useState } from 'react';
import ChessBoard from './ChessBoard';

const AICoachModal = ({ onClose }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [moveNumber, setMoveNumber] = useState(1);
  const [coachMessage, setCoachMessage] = useState("Welcome! Let's start with a training game. I'll guide you through important concepts as we play.");

  const coachInstructions = [
    "Great! You're developing your pieces early. This is a fundamental principle of opening play.",
    "Notice how controlling the center gives your pieces more mobility and influence.",
    "Think about piece safety before making your move. Is this piece protected?",
    "Excellent tactical awareness! You spotted the fork opportunity.",
    "In the endgame, king activity becomes crucial. Centralize your king!"
  ];

  const handleStartGame = () => {
    setGameStarted(true);
    setCoachMessage("Let's begin! Play 1.e4 to control the center and develop quickly.");
  };

  const handleMove = (move, newFen) => {
    const randomInstruction = coachInstructions[Math.floor(Math.random() * coachInstructions.length)];
    setCoachMessage(randomInstruction);
    setMoveNumber(prev => prev + 1);
    setCurrentPosition(newFen);
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
          <button 
            onClick={onClose}
            className="text-[#97a1c4] hover:text-white transition-colors p-1 sm:p-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[70vh] sm:h-[75vh] lg:h-[70vh]">
          {/* Chess Board Section */}
          <div className="flex-1 p-3 sm:p-6 lg:border-r lg:border-[#374162]">
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
                  <button 
                    onClick={handleStartGame}
                    className="bg-blue-800 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Start Training Game
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChessBoard 
                    position={currentPosition}
                    onMove={handleMove}
                    interactive={true}
                    showNotation={true}
                    engineEnabled={false}
                  />
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
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">Coach Magnus</p>
                  <p className="text-green-400 text-xs">● Online</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#374162] rounded-lg p-2 sm:p-3">
                  <p className="text-white text-sm">{coachMessage}</p>
                  <p className="text-[#97a1c4] text-xs mt-1">Coach Magnus</p>
                </div>
                
                {gameStarted && (
                  <div className="bg-blue-800 rounded-lg p-2 sm:p-3">
                    <p className="text-white text-sm">I'm ready to learn!</p>
                    <p className="text-blue-200 text-xs mt-1">You</p>
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
            <button className="bg-[#374162] hover:bg-[#455173] text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm flex-1 sm:flex-none">
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
