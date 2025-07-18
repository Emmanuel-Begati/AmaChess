import React, { useRef } from 'react';
import ChessBoard, { ChessBoardRef } from './ChessGame';
import useStockfishGame from '../hooks/useStockfishGame';

const StockfishChessGame: React.FC = () => {
  const {
    gameState,
    moveHistory,
    customSquareStyles,
    showEvaluation,
    apiConnected,
    startNewGame,
    changeDifficulty,
    handlePlayerMove,
    formatEvaluation,
    getEvaluationColor,
    getStatusMessage,
    getHint,
    getAnalysis,
    difficultyOptions,
    setShowEvaluation
  } = useStockfishGame();

  const chessBoardRef = useRef<ChessBoardRef>(null);

  // Handle move from ChessBoard component
  const onMove = async (moveDetails: any, newFen: string) => {
    return await handlePlayerMove(moveDetails, newFen);
  };

  // Get hint from Stockfish
  const handleGetHint = async () => {
    const hint = await getHint();
    if (hint) {
      alert(`Hint: ${hint}`);
    } else {
      alert('Unable to get hint at this time.');
    }
  };

  // Get analysis from Stockfish
  const handleGetAnalysis = async () => {
    const analysis = await getAnalysis();
    if (analysis) {
      console.log('Analysis:', analysis);
      alert(`Best move: ${analysis.bestMove}\nEvaluation: ${formatEvaluation(analysis.evaluation)}`);
    } else {
      alert('Unable to get analysis at this time.');
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Play Against Stockfish</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">
            {apiConnected ? 'Connected to Stockfish API' : 'Disconnected from Stockfish API'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chess Board */}
        <div className="xl:col-span-2">
          <ChessBoard
            ref={chessBoardRef}
            position={gameState.fen}
            onMove={onMove}
            interactive={gameState.isPlayerTurn && gameState.status === 'active'}
            disabled={!gameState.isPlayerTurn || gameState.status !== 'active' || gameState.thinking}
            orientation={gameState.playerColor}
            customSquareStyles={customSquareStyles}
            showNotation={true}
            engineEnabled={showEvaluation}
          />
        </div>

        {/* Game Controls and Info */}
        <div className="space-y-6">
          {/* Game Status */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-6 rounded-xl shadow-xl border border-[#374162]/50">
            <h2 className="text-xl font-semibold text-white mb-4">Game Status</h2>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-white">{getStatusMessage()}</p>
                {gameState.thinking && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                  </div>
                )}
              </div>

              {gameState.evaluation && showEvaluation && (
                <div className="bg-[#1a2636] p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Position Evaluation</p>
                  <p className={`font-bold text-lg ${getEvaluationColor(gameState.evaluation)}`}>
                    {formatEvaluation(gameState.evaluation)}
                  </p>
                </div>
              )}

              {gameState.status !== 'active' && gameState.winner && (
                <div className={`p-3 rounded-lg text-center ${
                  gameState.winner === gameState.playerColor 
                    ? 'bg-green-900/20 border border-green-500 text-green-400' 
                    : gameState.winner === 'draw'
                    ? 'bg-yellow-900/20 border border-yellow-500 text-yellow-400'
                    : 'bg-red-900/20 border border-red-500 text-red-400'
                }`}>
                  <p className="font-bold">
                    {gameState.winner === gameState.playerColor ? '🎉 You Win!' :
                     gameState.winner === 'draw' ? '🤝 Draw!' : '😢 You Lose!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-6 rounded-xl shadow-xl border border-[#374162]/50">
            <h2 className="text-xl font-semibold text-white mb-4">Game Controls</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => startNewGame('white')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  disabled={gameState.thinking}
                >
                  Play as White
                </button>
                
                <button 
                  onClick={() => startNewGame('black')}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  disabled={gameState.thinking}
                >
                  Play as Black
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={gameState.difficulty}
                  onChange={(e) => changeDifficulty(e.target.value as any)}
                  className="w-full bg-[#1a2636] border border-[#374162] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={gameState.thinking || gameState.status !== 'active'}
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.elo})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {difficultyOptions.find(opt => opt.value === gameState.difficulty)?.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Show Evaluation
                </label>
                <button
                  onClick={() => setShowEvaluation(!showEvaluation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showEvaluation ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showEvaluation ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* AI Assistance */}
          {apiConnected && gameState.status === 'active' && gameState.isPlayerTurn && (
            <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-6 rounded-xl shadow-xl border border-[#374162]/50">
              <h2 className="text-xl font-semibold text-white mb-4">AI Assistance</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleGetHint}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  disabled={gameState.thinking}
                >
                  💡 Get Hint
                </button>
                
                <button
                  onClick={handleGetAnalysis}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  disabled={gameState.thinking}
                >
                  🧠 Get Analysis
                </button>
              </div>
            </div>
          )}

          {/* Move History */}
          <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] p-6 rounded-xl shadow-xl border border-[#374162]/50">
            <h2 className="text-xl font-semibold text-white mb-4">Move History</h2>
            
            {moveHistory.length === 0 ? (
              <p className="text-gray-400 text-center">No moves yet</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium text-center border-b border-gray-700 pb-2 mb-2">White</div>
                  <div className="font-medium text-center border-b border-gray-700 pb-2 mb-2">Black</div>
                  
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                    const whiteMove = moveHistory[i * 2];
                    const blackMove = moveHistory[i * 2 + 1];
                    
                    return (
                      <React.Fragment key={i}>
                        <div className="text-center py-1 bg-[#1a2636] rounded">
                          <span className="font-mono">{whiteMove?.san || ''}</span>
                          {whiteMove?.evaluation && showEvaluation && (
                            <div className={`text-xs ${getEvaluationColor(whiteMove.evaluation)}`}>
                              {formatEvaluation(whiteMove.evaluation)}
                            </div>
                          )}
                        </div>
                        <div className="text-center py-1 bg-[#1a2636] rounded">
                          <span className="font-mono">{blackMove?.san || ''}</span>
                          {blackMove?.evaluation && showEvaluation && (
                            <div className={`text-xs ${getEvaluationColor(blackMove.evaluation)}`}>
                              {formatEvaluation(blackMove.evaluation)}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockfishChessGame;
