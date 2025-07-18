import React, { useState, useRef } from 'react';
import { Chess } from 'chess.js';

// Simple fallback ChessBoard component if import fails
const FallbackChessBoard = ({ position, onMove, ...props }) => {
  console.log('Using fallback ChessBoard');
  return (
    <div className="w-96 h-96 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
      <p className="text-gray-600">ChessBoard component not available</p>
    </div>
  );
};

// Try to import ChessBoard, fallback if it fails
let ChessBoard;
try {
  ChessBoard = require('../components/ChessBoard').default;
  console.log('ChessBoard imported successfully');
} catch (error) {
  console.error('Failed to import ChessBoard:', error);
  ChessBoard = FallbackChessBoard;
}

const ChessBoardTest = () => {
  console.log('ChessBoardTest rendering...');
  const [position, setPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [moveHistory, setMoveHistory] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const chessBoardRef = useRef(null);

  const handleMove = (moveDetails, newFen) => {
    console.log('Test - Move made:', moveDetails);
    console.log('Test - New position:', newFen);
    
    setPosition(newFen);
    setMoveHistory(prev => [...prev, moveDetails]);
    
    addTestResult(`Move: ${moveDetails.san} - Success`, 'success');
  };

  const addTestResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runAutomatedTests = () => {
    addTestResult('Starting automated tests...', 'info');
    
    // Test 1: Reset to starting position
    setPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    addTestResult('Reset to starting position', 'success');
    
    // Test 2: Set up a specific position
    setTimeout(() => {
      setPosition('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      addTestResult('Set position with e2-e4 played', 'success');
    }, 1000);
    
    // Test 3: Try AI move
    setTimeout(() => {
      if (chessBoardRef.current) {
        const result = chessBoardRef.current.makeAIMove('e7e5');
        if (result) {
          addTestResult('AI move e7-e5 successful', 'success');
        } else {
          addTestResult('AI move failed', 'error');
        }
      }
    }, 2000);
  };

  const clearTests = () => {
    setTestResults([]);
    setMoveHistory([]);
  };

  const testPositions = [
    {
      name: 'Starting Position',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    {
      name: 'Scholar\'s Mate',
      fen: 'rnb1kbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq e6 0 3'
    },
    {
      name: 'Endgame Position',
      fen: '8/8/8/8/8/8/4K3/4k3 w - - 0 1'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">ChessBoard Component Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ChessBoard */}
          <div className="bg-[#272e45] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Interactive ChessBoard</h2>
            <ChessBoard
              ref={chessBoardRef}
              position={position}
              onMove={handleMove}
              interactive={true}
              showNotation={true}
              engineEnabled={true}
            />
          </div>
          
          {/* Test Controls */}
          <div className="space-y-4">
            {/* Test Positions */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Test Positions</h3>
              <div className="space-y-2">
                {testPositions.map((pos, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setPosition(pos.fen);
                      addTestResult(`Loaded: ${pos.name}`, 'info');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-left"
                  >
                    {pos.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Test Controls */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={runAutomatedTests}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                >
                  Run Automated Tests
                </button>
                <button
                  onClick={clearTests}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                  Clear Test Results
                </button>
              </div>
            </div>
            
            {/* Move History */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Move History</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-400">No moves made</p>
                ) : (
                  moveHistory.map((move, index) => (
                    <div key={index} className="text-sm bg-[#374162] p-2 rounded">
                      {index + 1}. {move.san} ({move.from}-{move.to})
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Test Results */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {testResults.length === 0 ? (
                  <p className="text-gray-400">No test results</p>
                ) : (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${
                        result.type === 'success' ? 'bg-green-900 text-green-200' :
                        result.type === 'error' ? 'bg-red-900 text-red-200' :
                        'bg-blue-900 text-blue-200'
                      }`}
                    >
                      <span className="text-xs opacity-70">{result.timestamp}</span>
                      <br />
                      {result.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Position Info */}
        <div className="mt-6 bg-[#272e45] rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">Current Position</h3>
          <div className="bg-[#121621] p-3 rounded font-mono text-sm">
            {position}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoardTest;
