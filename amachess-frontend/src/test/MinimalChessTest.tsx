import React, { useState } from 'react';
import { Chess } from 'chess.js';

const MinimalChessTest = () => {
  const [game] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [moves, setMoves] = useState([]);
  const [testOutput, setTestOutput] = useState([]);

  const addOutput = (message, type = 'info') => {
    setTestOutput(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const testBasicMoves = () => {
    addOutput('Testing basic moves...', 'info');
    
    const testGame = new Chess();
    
    // Test move 1: e4
    try {
      const move1 = testGame.move('e4');
      if (move1) {
        addOutput('✓ e2-e4 move successful', 'success');
      } else {
        addOutput('✗ e2-e4 move failed', 'error');
      }
    } catch (error) {
      addOutput(`✗ e2-e4 error: ${error.message}`, 'error');
    }
    
    // Test move 2: e5
    try {
      const move2 = testGame.move('e5');
      if (move2) {
        addOutput('✓ e7-e5 move successful', 'success');
      } else {
        addOutput('✗ e7-e5 move failed', 'error');
      }
    } catch (error) {
      addOutput(`✗ e7-e5 error: ${error.message}`, 'error');
    }
    
    // Test invalid move
    try {
      const invalidMove = testGame.move('e6');
      if (invalidMove) {
        addOutput('✗ Invalid move e7-e6 was allowed', 'error');
      } else {
        addOutput('✓ Invalid move e7-e6 was correctly rejected', 'success');
      }
    } catch (error) {
      addOutput('✓ Invalid move e7-e6 was correctly rejected', 'success');
    }
    
    setPosition(testGame.fen());
    setMoves(testGame.history());
  };

  const testGameStates = () => {
    addOutput('Testing game states...', 'info');
    
    const testGame = new Chess();
    
    // Test initial state
    addOutput(`Initial turn: ${testGame.turn() === 'w' ? 'White' : 'Black'}`, 'info');
    addOutput(`Initial check: ${testGame.inCheck()}`, 'info');
    addOutput(`Initial checkmate: ${testGame.isCheckmate()}`, 'info');
    addOutput(`Initial game over: ${testGame.isGameOver()}`, 'info');
    
    // Test after some moves
    testGame.move('e4');
    testGame.move('e5');
    testGame.move('Bc4');
    testGame.move('Nc6');
    testGame.move('Qh5');
    testGame.move('Nf6');
    testGame.move('Qxf7#');
    
    addOutput(`After Scholar's Mate - Checkmate: ${testGame.isCheckmate()}`, testGame.isCheckmate() ? 'success' : 'error');
    addOutput(`After Scholar's Mate - Game Over: ${testGame.isGameOver()}`, testGame.isGameOver() ? 'success' : 'error');
    
    setPosition(testGame.fen());
    setMoves(testGame.history());
  };

  const testFENHandling = () => {
    addOutput('Testing FEN handling...', 'info');
    
    const testPositions = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', // After e4
      '8/8/8/8/8/8/4K3/4k3 w - - 0 1' // King endgame
    ];
    
    testPositions.forEach((fen, index) => {
      try {
        const testGame = new Chess(fen);
        addOutput(`✓ FEN ${index + 1} loaded successfully`, 'success');
        addOutput(`  Position: ${testGame.ascii()}`, 'info');
      } catch (error) {
        addOutput(`✗ FEN ${index + 1} failed: ${error.message}`, 'error');
      }
    });
  };

  const clearOutput = () => {
    setTestOutput([]);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setPosition(newGame.fen());
    setMoves([]);
    addOutput('Game reset to starting position', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Minimal Chess.js Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="bg-[#272e45] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={testBasicMoves}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Test Basic Moves
              </button>
              
              <button
                onClick={testGameStates}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              >
                Test Game States
              </button>
              
              <button
                onClick={testFENHandling}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
              >
                Test FEN Handling
              </button>
              
              <button
                onClick={resetGame}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg"
              >
                Reset Game
              </button>
              
              <button
                onClick={clearOutput}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
              >
                Clear Output
              </button>
            </div>
            
            {/* Game Info */}
            <div className="mt-6 space-y-3">
              <div className="bg-[#374162] p-3 rounded">
                <h3 className="font-semibold mb-2">Current Position</h3>
                <div className="text-xs font-mono bg-[#121621] p-2 rounded">
                  {position}
                </div>
              </div>
              
              <div className="bg-[#374162] p-3 rounded">
                <h3 className="font-semibold mb-2">Move History</h3>
                <div className="text-sm">
                  {moves.length === 0 ? (
                    <span className="text-gray-400">No moves</span>
                  ) : (
                    moves.join(', ')
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Test Output */}
          <div className="bg-[#272e45] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Test Output</h2>
            
            <div className="bg-[#121621] rounded p-4 h-96 overflow-y-auto">
              {testOutput.length === 0 ? (
                <p className="text-gray-400">No test output</p>
              ) : (
                <div className="space-y-2">
                  {testOutput.map((output, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${
                        output.type === 'success' ? 'bg-green-900 text-green-200' :
                        output.type === 'error' ? 'bg-red-900 text-red-200' :
                        'bg-blue-900 text-blue-200'
                      }`}
                    >
                      {output.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalChessTest;
