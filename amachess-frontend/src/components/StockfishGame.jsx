import React, { useState, useEffect, useRef } from 'react';
import ChessBoard from './ChessBoard';
import { Chess } from 'chess.js';

const StockfishGame = () => {
  // Game state
  const [gameState, setGameState] = useState({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    playerColor: 'white',
    isPlayerTurn: true,
    status: 'active',
    thinking: false,
    difficulty: 'intermediate',
    evaluation: null
  });
  
  const [moveHistory, setMoveHistory] = useState([]);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [showEvaluation, setShowEvaluation] = useState(true);
  

  
  // Ref for accessing ChessBoard methods
  const chessBoardRef = useRef(null);
  
  // Initialize a new game
useEffect(() => {
  console.log('✅ gameState.fen =', gameState.fen);
}, [gameState.fen]);


  // Start a new chess game
  const startNewGame = (playerColor = 'white') => {
    const newFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    setGameState(prev => ({
      ...prev,
      fen: newFen,
      playerColor,
      isPlayerTurn: playerColor === 'white',
      status: 'active',
      thinking: false,
      evaluation: null
    }));
    
    setMoveHistory([]);
    setCustomSquareStyles({});
    
    // If computer moves first (player is black)
    if (playerColor === 'black') {
      // Set thinking state immediately
      setGameState(prev => ({
        ...prev,
        thinking: true,
        isPlayerTurn: false
      }));
      
      // Short timeout to allow board to render
      setTimeout(() => getComputerMove(newFen), 100);
    }
  };
  
  // Handle player moves
  const handleMove = async (moveDetails) => {
    console.log('Move received in StockfishGame:', moveDetails);
    
    // Create a new Chess instance from current FEN to validate and get new FEN
    const tempGame = new Chess(gameState.fen);
    const validatedMove = tempGame.move({
      from: moveDetails.from,
      to: moveDetails.to,
      promotion: moveDetails.promotion || 'q'
    });
    
    if (!validatedMove) {
      console.error('Invalid move:', moveDetails);
      return false;
    }
    
    const newFen = tempGame.fen();
    console.log('New position after player move:', newFen);
    
    // Update last move highlighting
    setCustomSquareStyles({
      [moveDetails.from]: { backgroundColor: 'rgba(17, 95, 212, 0.4)' },
      [moveDetails.to]: { backgroundColor: 'rgba(17, 95, 212, 0.6)' }
    });
    
    // Add move to history
    setMoveHistory(prev => [...prev, validatedMove]);
    
    // Update game state with new position
    setGameState(prev => ({
      ...prev,
      fen: newFen,
      isPlayerTurn: false,
      thinking: true
    }));
    
    // Check for game end
    if (checkGameEnd(tempGame)) {
      return true;
    }
    
    // Get computer's response with the NEW position
    await getComputerMove(newFen);
    return true;
  };
  
const getComputerMove = async (fen) => {
  try {
    console.log('Getting computer move for position:', fen);

    setGameState(prev => ({
      ...prev,
      thinking: true
    }));

    const response = await fetch('http://localhost:3001/api/stockfish/play/move-difficulty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen,
        difficulty: gameState.difficulty,
        timeLimit: getDifficultyTimeLimit(gameState.difficulty)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get Stockfish move');
    }

    const data = await response.json();
    console.log('Stockfish response:', data);

    if (!data.success || !data.bestMove) {
      throw new Error('Invalid response from Stockfish');
    }

    // Use chess.js to apply Stockfish move
    const tempGame = new Chess(fen);
    const move = tempGame.move({
      from: data.bestMove.slice(0, 2),
      to: data.bestMove.slice(2, 4),
      promotion: 'q', // always promote to queen for simplicity
    });

    if (move) {
      setGameState(prev => ({
        ...prev,
        fen: tempGame.fen(),
        isPlayerTurn: true,
        thinking: false,
        evaluation: data.evaluation || data.game?.evaluation
      }));
      setMoveHistory(prev => [...prev, move]);
      setCustomSquareStyles({
        [move.from]: { backgroundColor: 'rgba(17, 95, 212, 0.4)' },
        [move.to]: { backgroundColor: 'rgba(17, 95, 212, 0.6)' }
      });
      checkGameEnd(tempGame);
    } else {
      console.error('Stockfish returned invalid move:', data.bestMove);
      setGameState(prev => ({ ...prev, thinking: false, isPlayerTurn: true }));
    }
  } catch (error) {
    console.error('Error getting computer move:', error);

    // Fallback to random move if Stockfish fails
    console.log('Falling back to random move');
    const tempGame = new Chess(fen);
    const possibleMoves = tempGame.moves();

    if (possibleMoves.length > 0) {
      const randomMoveSAN = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const move = tempGame.move(randomMoveSAN);

      if (move) {
        setGameState(prev => ({
          ...prev,
          fen: tempGame.fen(),
          isPlayerTurn: true,
          thinking: false,
          evaluation: { value: 0, type: 'cp' }
        }));
        setMoveHistory(prev => [...prev, move]);
        setCustomSquareStyles({
          [move.from]: { backgroundColor: 'rgba(17, 95, 212, 0.4)' },
          [move.to]: { backgroundColor: 'rgba(17, 95, 212, 0.6)' }
        });
        checkGameEnd(tempGame);
      }
    } else {
      setGameState(prev => ({
        ...prev,
        thinking: false,
        status: 'draw'
      }));
    }
  }
};

  
  // Get time limit based on difficulty
  const getDifficultyTimeLimit = (difficulty) => {
    const timeLimits = {
      beginner: 1000,
      intermediate: 2000,
      advanced: 4000,
      expert: 6000,
      maximum: 10000
    };
    return timeLimits[difficulty] || 2000;
  };
  
  // Check if the game has ended
  const checkGameEnd = (chess) => {
    if (chess.isGameOver()) {
      let status;
      
      if (chess.isCheckmate()) {
        status = `checkmate_${chess.turn() === 'w' ? 'black' : 'white'}`; // Opposite color wins
      } else if (chess.isDraw()) {
        status = 'draw';
      } else if (chess.isStalemate()) {
        status = 'stalemate';
      } else if (chess.isThreefoldRepetition()) {
        status = 'repetition';
      } else if (chess.isInsufficientMaterial()) {
        status = 'insufficient';
      } else {
        status = 'draw';
      }
      
      setGameState(prev => ({
        ...prev,
        status,
        isPlayerTurn: false,
        thinking: false
      }));
      
      return true;
    }
    
    return false;
  };
  
  // Get status message for display
  const getStatusMessage = () => {
    const { status, playerColor, thinking } = gameState;
    
    if (thinking) {
      return 'Stockfish is thinking...';
    }
    
    if (status === 'active') {
      return `Your turn (${playerColor})`;
    }
    
    if (status.startsWith('checkmate')) {
      const winner = status.split('_')[1];
      return `Checkmate! ${winner === playerColor ? 'You won!' : 'Stockfish won!'}`;
    }
    
    if (status === 'draw' || status === 'stalemate' || status === 'repetition' || status === 'insufficient') {
      return 'Game drawn';
    }
    
    return 'Game over';
  };
  
  // Format evaluation score for display
  const formatEvaluation = (eval_) => {
    if (!eval_) return '0.00';
    
    if (eval_.type === 'mate') {
      return `Mate in ${Math.abs(eval_.value)}`;
    }
    
    const score = eval_.value / 100;
    return score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  };
  
  // Get color for evaluation display
  const getEvaluationColor = (eval_) => {
    if (!eval_) return 'text-white';
    
    if (eval_.type === 'mate') {
      return eval_.value > 0 ? 'text-green-400' : 'text-red-400';
    }
    
    if (eval_.value > 50) return 'text-green-400';
    if (eval_.value < -50) return 'text-red-400';
    return 'text-white';
  };
  
  // Change difficulty level
  const handleDifficultyChange = (difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  };
  
  // Get difficulty options
  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', elo: '800 Elo' },
    { value: 'intermediate', label: 'Intermediate', elo: '1500 Elo' },
    { value: 'advanced', label: 'Advanced', elo: '2000 Elo' },
    { value: 'expert', label: 'Expert', elo: '2500 Elo' },
    { value: 'maximum', label: 'Maximum', elo: '3200+ Elo' }
  ];
console.log('🧠 FEN passed to ChessBoard:', gameState.fen);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Play Against Stockfish</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Chess Board */}
          <ChessBoard
            ref={chessBoardRef}
            position={gameState.fen}
            onMove={handleMove}
            interactive={gameState.isPlayerTurn && gameState.status === 'active' && !gameState.thinking}
            disabled={!gameState.isPlayerTurn || gameState.status !== 'active' || gameState.thinking}
            orientation={gameState.playerColor}
            customSquareStyles={customSquareStyles}
            showNotation={true}
            engineEnabled={showEvaluation}
          />
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Game Controls */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => startNewGame('white')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                New Game as White
              </button>
              
              <button 
                onClick={() => startNewGame('black')}
                className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg"
              >
                New Game as Black
              </button>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Difficulty</h3>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleDifficultyChange(option.value)}
                      className={`py-1 px-2 rounded-md text-sm ${
                        gameState.difficulty === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      {option.label}
                      <span className="block text-xs opacity-70">{option.elo}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="showEval"
                  checked={showEvaluation}
                  onChange={() => setShowEvaluation(!showEvaluation)}
                  className="mr-2"
                />
                <label htmlFor="showEval">Show evaluation</label>
              </div>
            </div>
          </div>
          
          {/* Game Status */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Game Status</h2>
            <p className="font-medium text-lg">{getStatusMessage()}</p>
            
            {gameState.evaluation && showEvaluation && (
              <div className="mt-2">
                <p className="font-medium">
                  Evaluation: <span className={getEvaluationColor(gameState.evaluation)}>
                    {formatEvaluation(gameState.evaluation)}
                  </span>
                </p>
              </div>
            )}
          </div>
          
          {/* Move History */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-4 rounded-xl shadow-lg flex-1 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Move History</h2>
            
            {moveHistory.length === 0 ? (
              <p className="text-gray-400">No moves yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium text-center border-b border-gray-700 pb-1">White</div>
                <div className="font-medium text-center border-b border-gray-700 pb-1">Black</div>
                
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                  const whiteMove = moveHistory[i * 2];
                  const blackMove = moveHistory[i * 2 + 1];
                  return (
                    <React.Fragment key={i}>
                      <div className="text-center py-1 bg-[#1a2636] rounded">
                        {whiteMove ? `${i + 1}. ${whiteMove.san}` : ''}
                      </div>
                      <div className="text-center py-1 bg-[#1a2636] rounded">
                        {blackMove ? blackMove.san : ''}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockfishGame;
