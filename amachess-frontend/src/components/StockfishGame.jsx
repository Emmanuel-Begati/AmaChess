import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';

const StockfishGame = () => {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    playerColor: 'white',
    isPlayerTurn: true,
    gameStatus: 'active',
    lastMove: null,
    evaluation: null,
    thinking: false,
    gameId: null,
    difficulty: 'maximum',
    nodesSearched: 0,
    depth: 0,
    calculationTime: 0
  });
  const [gameHistory, setGameHistory] = useState([]);
  const [stockfishResponse, setStockfishResponse] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(true);
  const [gameResult, setGameResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState('maximum');
  const [lastMoveSquares, setLastMoveSquares] = useState({});
  const gameRef = useRef(game);

  // Initialize new game
  useEffect(() => {
    startNewGame();
  }, []);

  // Update game reference when game changes
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const startNewGame = async (playerColor = 'white') => {
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/play/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerColor, difficulty })
      });

      if (response.ok) {
        const data = await response.json();
        const newGame = new Chess();
        
        let isPlayerTurn = playerColor === 'white';
        let currentFen = data.game.startingFen;

        // If player is black, Stockfish moves first
        if (playerColor === 'black' && data.game.stockfishMove) {
          const move = newGame.move(data.game.stockfishMove);
          if (move) {
            currentFen = newGame.fen();
            setGameHistory([move]);
            isPlayerTurn = true;
          }
        }

        setGame(newGame);
        setGameState({
          fen: currentFen,
          playerColor,
          isPlayerTurn,
          gameStatus: 'active',
          lastMove: data.game.stockfishMove,
          evaluation: null,
          thinking: false,
          gameId: data.game.id,
          difficulty,
          nodesSearched: 0,
          depth: 0,
          calculationTime: 0
        });

        setGameHistory(playerColor === 'black' && data.game.stockfishMove ? [data.game.stockfishMove] : []);
        setGameResult(null);
        setStockfishResponse(null);

        // Get initial position evaluation
        await evaluatePosition(currentFen);
      }
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  const evaluatePosition = async (fen) => {
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/play/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen })
      });

      if (response.ok) {
        const data = await response.json();
        setGameState(prev => ({ ...prev, evaluation: data.evaluation }));
      }
    } catch (error) {
      console.error('Error evaluating position:', error);
    }
  };

  const makePlayerMove = async (move) => {
    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'active') {
      console.log('Move rejected: not player turn or game not active');
      return false;
    }

    console.log('Player attempting move:', move, 'Current FEN:', gameState.fen);

    try {
      const newGame = new Chess(gameState.fen);
      
      // Handle different move formats
      let moveResult;
      if (typeof move === 'string') {
        moveResult = newGame.move(move);
      } else if (move.from && move.to) {
        moveResult = newGame.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q'
        });
      } else {
        moveResult = newGame.move(move);
      }
      
      if (!moveResult) {
        console.log('Invalid move attempted:', move);
        return false;
      }

      const newFen = newGame.fen();
      console.log('Move successful:', moveResult.san, 'New FEN:', newFen);
      
      // Update the game state immediately
      setGame(newGame);
      setGameState(prev => ({
        ...prev,
        fen: newFen,
        isPlayerTurn: false,
        lastMove: moveResult,
        thinking: true
      }));

      // Update move highlighting
      setLastMoveSquares({
        [moveResult.from]: { backgroundColor: 'rgba(17, 95, 212, 0.4)' },
        [moveResult.to]: { backgroundColor: 'rgba(17, 95, 212, 0.6)' }
      });

      setGameHistory(prev => [...prev, moveResult]);

      // Check for game end
      if (newGame.isGameOver()) {
        handleGameEnd(newGame);
        return true;
      }

      // Get Stockfish response (don't await this to allow move to be processed immediately)
      getStockfishMove(newFen);
      return true;

    } catch (error) {
      console.error('Error making move:', error, move);
      return false;
    }
  };

  const getStockfishMove = async (fen) => {
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/play/move-difficulty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, difficulty })
      });

      if (response.ok) {
        const data = await response.json();
        const stockfishMove = data.game.move;
        
        if (stockfishMove) {
          const newGame = new Chess(fen);
          const moveResult = newGame.move(stockfishMove);
          
          if (moveResult) {
            const newFen = newGame.fen();
            setGame(newGame);
            setGameState(prev => ({
              ...prev,
              fen: newFen,
              isPlayerTurn: true,
              lastMove: moveResult,
              thinking: false,
              evaluation: data.game.evaluation,
              nodesSearched: data.game.nodesSearched || 0,
              depth: data.game.depth || 0,
              calculationTime: data.game.calculationTime || 0
            }));

            // Update move highlighting for Stockfish move
            setLastMoveSquares({
              [moveResult.from]: { backgroundColor: 'rgba(220, 38, 127, 0.4)' },
              [moveResult.to]: { backgroundColor: 'rgba(220, 38, 127, 0.6)' }
            });

            setGameHistory(prev => [...prev, moveResult]);
            setStockfishResponse(data.game);

            // Check for game end
            if (newGame.isGameOver()) {
              handleGameEnd(newGame);
            } else {
              // Evaluate new position
              await evaluatePosition(newFen);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting Stockfish move:', error);
      setGameState(prev => ({ ...prev, thinking: false }));
    }
  };

  const handleGameEnd = (chess) => {
    let result = 'Draw';
    let reason = '';

    if (chess.isCheckmate()) {
      result = chess.turn() === 'w' ? 'Black wins' : 'White wins';
      reason = 'by checkmate';
    } else if (chess.isStalemate()) {
      reason = 'by stalemate';
    } else if (chess.isInsufficientMaterial()) {
      reason = 'by insufficient material';
    } else if (chess.isThreefoldRepetition()) {
      reason = 'by threefold repetition';
    } else if (chess.isDraw()) {
      reason = 'by 50-move rule';
    }

    setGameResult({ result, reason });
    setGameState(prev => ({ ...prev, gameStatus: 'finished', thinking: false }));
  };

  const formatEvaluation = (evaluation) => {
    if (!evaluation) return 'Evaluating...';
    
    if (evaluation.evaluation?.type === 'mate') {
      const mateIn = evaluation.evaluation.value;
      return mateIn > 0 ? `White mates in ${mateIn}` : `Black mates in ${Math.abs(mateIn)}`;
    }
    
    if (evaluation.evaluation?.type === 'centipawn') {
      const pawns = (evaluation.evaluation.value / 100).toFixed(1);
      return `${pawns > 0 ? '+' : ''}${pawns}`;
    }
    
    return evaluation.advantage || 'Equal';
  };

  const getEvaluationColor = (evaluation) => {
    if (!evaluation?.evaluation) return 'text-gray-600';
    
    if (evaluation.evaluation.type === 'mate') {
      return evaluation.evaluation.value > 0 ? 'text-green-600' : 'text-red-600';
    }
    
    if (evaluation.evaluation.type === 'centipawn') {
      const value = evaluation.evaluation.value;
      if (value > 100) return 'text-green-600';
      if (value > 50) return 'text-green-500';
      if (value > -50) return 'text-gray-600';
      if (value > -100) return 'text-red-500';
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', description: '800 Elo', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', description: '1500 Elo', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', description: '2000 Elo', color: 'bg-orange-100 text-orange-800' },
    { value: 'expert', label: 'Expert', description: '2500 Elo', color: 'bg-red-100 text-red-800' },
    { value: 'maximum', label: 'Maximum', description: '3200+ Elo', color: 'bg-purple-100 text-purple-800' }
  ];

  const getDifficultyInfo = (diff) => {
    return difficultyOptions.find(opt => opt.value === diff) || difficultyOptions[4];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Play Against Stockfish</h1>
          <p className="text-gray-600">Challenge the world's strongest chess engine</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold">
                    {gameState.playerColor === 'white' ? 'You (White)' : 'You (Black)'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    gameState.isPlayerTurn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {gameState.isPlayerTurn ? 'Your Turn' : 'Stockfish Thinking...'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyInfo(difficulty).color}`}>
                    {getDifficultyInfo(difficulty).label} ({getDifficultyInfo(difficulty).description})
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => startNewGame('white')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Game (White)
                  </button>
                  <button
                    onClick={() => startNewGame('black')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    New Game (Black)
                  </button>
                </div>
              </div>

              {showSettings && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Game Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {difficultyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label} - {option.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showEvaluation}
                          onChange={(e) => setShowEvaluation(e.target.checked)}
                          className="mr-2"
                        />
                        Show Position Evaluation
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <ChessBoard
                  position={gameState.fen}
                  onMove={makePlayerMove}
                  orientation={gameState.playerColor}
                  disabled={!gameState.isPlayerTurn || gameState.thinking || gameState.gameStatus !== 'active'}
                  lastMove={gameState.lastMove}
                  interactive={true}
                  showNotation={true}
                  customSquareStyles={lastMoveSquares}
                />
              </div>

              {gameState.thinking && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Stockfish is thinking...</span>
                  </div>
                </div>
              )}

              {gameResult && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Game Over</h3>
                  <p className="text-yellow-700">
                    {gameResult.result} {gameResult.reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Game Info Panel */}
          <div className="space-y-6">
            {/* Stockfish Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Stockfish Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyInfo(difficulty).color}`}>
                    {getDifficultyInfo(difficulty).label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Search Depth:</span>
                  <span className="font-medium text-blue-600">{gameState.depth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nodes Searched:</span>
                  <span className="font-medium text-blue-600">{gameState.nodesSearched.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calculation Time:</span>
                  <span className="font-medium text-blue-600">{(gameState.calculationTime / 1000).toFixed(2)}s</span>
                </div>
                {stockfishResponse && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Move:</span>
                    <span className="font-medium text-green-600">{stockfishResponse.move}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Position Evaluation */}
            {showEvaluation && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Position Evaluation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Evaluation:</span>
                    <span className={`font-medium ${getEvaluationColor(gameState.evaluation)}`}>
                      {formatEvaluation(gameState.evaluation)}
                    </span>
                  </div>
                  {gameState.evaluation?.bestMove && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Move:</span>
                      <span className="font-medium text-blue-600">{gameState.evaluation.bestMove}</span>
                    </div>
                  )}
                  {gameState.evaluation?.principalVariation && (
                    <div>
                      <span className="text-gray-600">Principal Variation:</span>
                      <div className="mt-1 text-sm font-mono text-gray-700">
                        {gameState.evaluation.principalVariation.slice(0, 5).join(' ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stockfish Info */}
            {stockfishResponse && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Stockfish Response</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Move:</span>
                    <span className="font-medium text-green-600">{stockfishResponse.move}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Depth:</span>
                    <span className="font-medium">{stockfishResponse.depth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{(stockfishResponse.calculationTime / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium text-red-600">{stockfishResponse.difficulty}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Game History</h3>
              <div className="max-h-64 overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">No moves yet</p>
                ) : (
                  <div className="space-y-2">
                    {gameHistory.map((move, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">{Math.floor(index / 2) + 1}.</span>
                        <span className="font-mono text-sm">
                          {move.san}
                        </span>
                        <span className="text-xs text-gray-500">
                          {index % 2 === 0 ? 'White' : 'Black'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showEvaluation}
                    onChange={(e) => setShowEvaluation(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Position Evaluation</span>
                </label>
                <button
                  onClick={() => evaluatePosition(gameState.fen)}
                  disabled={gameState.thinking}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Refresh Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockfishGame;
