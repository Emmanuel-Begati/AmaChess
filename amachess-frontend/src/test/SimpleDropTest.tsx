import React, { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const SimpleDropTest = () => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveSquares, setMoveSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [moveLog, setMoveLog] = useState([]);

  const logMove = (message, type = 'info') => {
    setMoveLog(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const makeAMove = useCallback((move) => {
    const gameCopy = new Chess(gamePosition);
    let result;
    
    try {
      if (typeof move === 'string') {
        result = gameCopy.move(move);
      } else {
        result = gameCopy.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q'
        });
      }
    } catch (error) {
      logMove(`Invalid move attempted: ${JSON.stringify(move)}`, 'error');
      return null;
    }
    
    if (result) {
      setGame(gameCopy);
      setGamePosition(gameCopy.fen());
      setLastMove(result);
      logMove(`Move successful: ${result.san} (${result.from}-${result.to})`, 'success');
      
      // Highlight the move
      setMoveSquares({
        [result.from]: { backgroundColor: 'rgba(17, 95, 212, 0.4)' },
        [result.to]: { backgroundColor: 'rgba(17, 95, 212, 0.6)' }
      });
      
      return result;
    }
    
    return null;
  }, [gamePosition]);

  const onDrop = useCallback((sourceSquare, targetSquare) => {
    logMove(`Drop attempted: ${sourceSquare} → ${targetSquare}`, 'info');
    
    // Clear previous move highlights
    setMoveSquares({});
    
    const moveResult = makeAMove({
      from: sourceSquare,
      to: targetSquare
    });
    
    return moveResult !== null;
  }, [makeAMove]);

  const onSquareClick = useCallback((square) => {
    // Get possible moves for the clicked square
    const moves = game.moves({
      square: square,
      verbose: true
    });
    
    if (moves.length > 0) {
      const newSquares = {};
      moves.forEach((move) => {
        newSquares[move.to] = {
          background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(74, 144, 226, 0.8) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      });
      newSquares[square] = {
        backgroundColor: 'rgba(74, 144, 226, 0.4)'
      };
      setMoveSquares(newSquares);
      logMove(`Showing ${moves.length} possible moves for ${square}`, 'info');
    } else {
      setMoveSquares({});
      logMove(`No moves available for ${square}`, 'info');
    }
  }, [game]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setMoveSquares({});
    setLastMove(null);
    logMove('Game reset to starting position', 'success');
  };

  const makeRandomMove = () => {
    const moves = game.moves();
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      makeAMove(randomMove);
    } else {
      logMove('No moves available for random move', 'error');
    }
  };

  const clearLog = () => {
    setMoveLog([]);
  };

  // Test specific positions
  const loadTestPosition = (fen, description) => {
    try {
      const testGame = new Chess(fen);
      setGame(testGame);
      setGamePosition(fen);
      setMoveSquares({});
      setLastMove(null);
      logMove(`Loaded test position: ${description}`, 'success');
    } catch (error) {
      logMove(`Failed to load position: ${error.message}`, 'error');
    }
  };

  const testPositions = [
    {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      description: 'Starting Position'
    },
    {
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      description: 'After 1.e4'
    },
    {
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4',
      description: 'Italian Game'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Simple Drop Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chessboard */}
          <div className="lg:col-span-2">
            <div className="bg-[#272e45] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Interactive Board</h2>
              <div className="flex justify-center">
                <Chessboard
                  position={gamePosition}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  boardWidth={400}
                  customSquareStyles={moveSquares}
                  customDarkSquareStyle={{ backgroundColor: '#233248' }}
                  customLightSquareStyle={{ backgroundColor: '#374162' }}
                  animationDuration={200}
                />
              </div>
              
              {/* Game Status */}
              <div className="mt-4 bg-[#374162] rounded p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Turn:</span> {game.turn() === 'w' ? 'White' : 'Black'}
                  </div>
                  <div>
                    <span className="font-semibold">Check:</span> {game.inCheck() ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-semibold">Checkmate:</span> {game.isCheckmate() ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-semibold">Game Over:</span> {game.isGameOver() ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              
              {lastMove && (
                <div className="mt-2 bg-[#374162] rounded p-3">
                  <span className="font-semibold">Last Move:</span> {lastMove.san} ({lastMove.from} → {lastMove.to})
                </div>
              )}
            </div>
          </div>
          
          {/* Controls and Log */}
          <div className="space-y-4">
            {/* Test Controls */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={resetGame}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
                >
                  Reset Game
                </button>
                <button
                  onClick={makeRandomMove}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
                >
                  Random Move
                </button>
                <button
                  onClick={clearLog}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
                >
                  Clear Log
                </button>
              </div>
            </div>
            
            {/* Test Positions */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Test Positions</h3>
              <div className="space-y-2">
                {testPositions.map((pos, index) => (
                  <button
                    key={index}
                    onClick={() => loadTestPosition(pos.fen, pos.description)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm text-left"
                  >
                    {pos.description}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Move Log */}
            <div className="bg-[#272e45] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Move Log</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {moveLog.length === 0 ? (
                  <p className="text-gray-400 text-sm">No moves logged</p>
                ) : (
                  moveLog.map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        log.type === 'success' ? 'bg-green-900 text-green-200' :
                        log.type === 'error' ? 'bg-red-900 text-red-200' :
                        'bg-blue-900 text-blue-200'
                      }`}
                    >
                      <span className="opacity-70">{log.timestamp}</span>
                      <br />
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDropTest;
