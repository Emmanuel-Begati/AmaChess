import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';

const StockfishIntegration = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [playerColor, setPlayerColor] = useState('white');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const chessBoardRef = useRef(null);

  // Handle player move
  const handleMove = (moveDetails, newFen) => {
    console.log('Player move:', moveDetails, 'New position:', newFen);
    
    // Update the game state
    setFen(newFen);
    setMoveHistory(prev => [...prev, moveDetails]);
    
    // Check game status
    const gameCopy = new Chess(newFen);
    updateStatus(gameCopy);
    
    // If game is over, return early
    if (gameCopy.isGameOver()) {
      return true;
    }
    
    // Request stockfish move
    getStockfishMove(newFen);
    return true;
  };

  // Get Stockfish's move
  const getStockfishMove = async (position) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/stockfish/play/move-difficulty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: position,
          difficulty: 'intermediate', // Adjust difficulty as needed
          timeLimit: 1000 // 1 second per move for quick responses
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Stockfish move');
      }

      const data = await response.json();
      console.log('Stockfish response:', data);

      // Apply Stockfish's move
      if (data.bestMove) {
        setEvaluation(data.evaluation);
        
        // Wait a moment before making the AI move
        setTimeout(() => {
          const gameCopy = new Chess(position);
          const move = gameCopy.move(data.bestMove);
          
          if (move) {
            setFen(gameCopy.fen());
            setMoveHistory(prev => [...prev, move]);
            updateStatus(gameCopy);
          }
          
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error getting Stockfish move:', error);
      setLoading(false);
    }
  };

  // Update game status
  const updateStatus = (chess) => {
    let statusText = '';
    
    if (chess.isCheckmate()) {
      statusText = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins`;
    } else if (chess.isDraw()) {
      statusText = 'Game ended in draw';
    } else if (chess.isCheck()) {
      statusText = `${chess.turn() === 'w' ? 'White' : 'Black'} is in check`;
    } else {
      statusText = `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;
    }
    
    setStatus(statusText);
  };

  // Reset the game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setEvaluation(null);
    updateStatus(newGame);
  };

  // Switch sides
  const switchSides = () => {
    setPlayerColor(playerColor === 'white' ? 'black' : 'white');
    
    // If switching to black, get stockfish move for white
    if (playerColor === 'white' && game.turn() === 'w') {
      getStockfishMove(game.fen());
    }
  };

  // Format evaluation for display
  const formatEvaluation = (eval_) => {
    if (!eval_) return 'Even';
    
    // Handle mate scores
    if (eval_.type === 'mate') {
      return `Mate in ${Math.abs(eval_.value)}`;
    }
    
    // Handle CP scores
    const score = eval_.value / 100;
    return score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Play Against Stockfish</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChessBoard 
            position={fen}
            onMove={handleMove}
            interactive={!loading && ((playerColor === 'white' && game.turn() === 'w') || 
                                     (playerColor === 'black' && game.turn() === 'b'))}
            showNotation={true}
            orientation={playerColor}
          />
        </div>
        
        <div className="space-y-6">
          {/* Game Controls */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                New Game
              </button>
              <button
                onClick={switchSides}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition"
              >
                Switch Sides
              </button>
            </div>
          </div>
          
          {/* Game Status */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Game Status</h2>
            <p className="text-lg font-medium">{status}</p>
            {loading && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-blue-400">Stockfish is thinking...</p>
              </div>
            )}
            {evaluation && (
              <div className="mt-2">
                <p className="text-sm">Evaluation: <span className="font-bold">{formatEvaluation(evaluation)}</span></p>
              </div>
            )}
          </div>
          
          {/* Move History */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 shadow-xl max-h-80 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Move History</h2>
            {moveHistory.length === 0 ? (
              <p className="text-gray-400">No moves yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium text-center border-b border-gray-700 pb-1">White</div>
                <div className="font-medium text-center border-b border-gray-700 pb-1">Black</div>
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="text-center py-1 bg-[#1a2636] rounded">{moveHistory[i*2]?.san || ''}</div>
                    <div className="text-center py-1 bg-[#1a2636] rounded">{moveHistory[i*2+1]?.san || ''}</div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockfishIntegration;
