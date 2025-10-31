import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard, { ChessBoardRef } from './ChessBoard';
import { stockfishAPI } from '../../utils/stockfish';

interface ChessAnalysisBoardProps {
  className?: string;
}

interface EvaluationData {
  value: number;
  type: 'centipawn' | 'mate';
}

interface AnalysisData {
  position: string;
  bestMove: string;
  evaluation: EvaluationData | null;
  principalVariation: string[];
  depth: number;
  mate: boolean;
  advantage: string;
}

const ChessAnalysisBoard: React.FC<ChessAnalysisBoardProps> = ({ className = '' }) => {
  const chessBoardRef = useRef<ChessBoardRef>(null);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const lastAnalyzedPosition = useRef<string>('');
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
      }
    };
  }, []);

  // Analyze position with Stockfish
  const analyzePosition = async (fen: string) => {
    // Prevent repeated analysis of the same position
    if (isAnalyzing || lastAnalyzedPosition.current === fen) return;
    
    setIsAnalyzing(true);
    setError(null);
    lastAnalyzedPosition.current = fen;
    
    try {
      const result = await stockfishAPI.evaluatePosition(fen, 15);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze position');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle move on the board
  const handleMove = ({ sourceSquare, targetSquare }: any) => {
    const newGame = new Chess(game.fen());
    
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        const newPosition = newGame.fen();
        setGame(newGame);
        setPosition(newPosition);
        
        // Add move to history
        const newMoveHistory = [...moveHistory.slice(0, currentMoveIndex + 1), move.san];
        setMoveHistory(newMoveHistory);
        setCurrentMoveIndex(newMoveHistory.length - 1);
        
        // Analyze the new position with throttling
        if (analysisTimeout.current) {
          clearTimeout(analysisTimeout.current);
        }
        analysisTimeout.current = setTimeout(() => {
          analyzePosition(newPosition);
        }, 1000);
        
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  };

  // Reset board to starting position
  const resetBoard = () => {
    const newGame = new Chess();
    const startPosition = newGame.fen();
    
    setGame(newGame);
    setPosition(startPosition);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setAnalysis(null);
    
    // Analyze starting position
    analyzePosition(startPosition);
  };

  // Navigate through move history
  const goToMove = (moveIndex: number) => {
    const newGame = new Chess();
    
    // Replay moves up to the selected index
    for (let i = 0; i <= moveIndex; i++) {
      if (i < moveHistory.length && moveHistory[i]) {
        try {
          const move = moveHistory[i];
          if (move) {
            newGame.move(move);
          }
        } catch (error) {
          console.error('Error replaying move:', error);
          return;
        }
      }
    }
    
    const newPosition = newGame.fen();
    setGame(newGame);
    setPosition(newPosition);
    setCurrentMoveIndex(moveIndex);
    
    // Analyze the position
    analyzePosition(newPosition);
  };

  // Format evaluation for display
  const formatEvaluation = (evaluation: EvaluationData | null) => {
    if (!evaluation) return '0.00';
    
    if (evaluation.type === 'mate') {
      return evaluation.value > 0 ? `+M${evaluation.value}` : `-M${Math.abs(evaluation.value)}`;
    }
    
    const pawns = evaluation.value / 100;
    return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
  };

  // Get evaluation color
  const getEvaluationColor = (evaluation: EvaluationData | null) => {
    if (!evaluation) return '#666';
    
    if (evaluation.type === 'mate') {
      return evaluation.value > 0 ? '#4CAF50' : '#f44336';
    }
    
    if (evaluation.value > 50) return '#4CAF50';
    if (evaluation.value < -50) return '#f44336';
    return '#666';
  };

  // Get evaluation bar width (for visual gauge)
  const getEvaluationBarWidth = (evaluation: EvaluationData | null) => {
    if (!evaluation) return 50;
    
    if (evaluation.type === 'mate') {
      return evaluation.value > 0 ? 100 : 0;
    }
    
    // Convert centipawns to percentage (clamped between 0-100)
    const normalized = Math.max(0, Math.min(100, 50 + (evaluation.value / 20)));
    return normalized;
  };

  // Initialize with starting position analysis
  useEffect(() => {
    analyzePosition(position);
  }, []);

  return (
    <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Position Analysis</h3>
        <button
          onClick={resetBoard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          Reset Board
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Chess Board */}
      <div className="mb-4">
        <ChessBoard
          ref={chessBoardRef}
          position={position}
          onMove={handleMove}
          orientation="white"
          disabled={isAnalyzing}
          animationDuration={200}
          highlightLastMove={true}
          showCoordinates={true}
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* Evaluation Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
          <span>Evaluation</span>
          <span style={{ color: getEvaluationColor(analysis?.evaluation || null) }}>
            {formatEvaluation(analysis?.evaluation || null)}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${getEvaluationBarWidth(analysis?.evaluation || null)}%`,
              background: analysis?.evaluation?.value && analysis.evaluation.value > 0 
                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                : 'linear-gradient(90deg, #ef4444, #f87171)'
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Black advantage</span>
          <span>White advantage</span>
        </div>
      </div>

      {/* Analysis Information */}
      {analysis && (
        <div className="mb-4 space-y-2">
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </div>
          )}
          
          {analysis.bestMove && (
            <div className="text-sm">
              <span className="text-gray-400">Best move: </span>
              <span className="text-white font-mono">{analysis.bestMove}</span>
            </div>
          )}
          
          {analysis.principalVariation && analysis.principalVariation.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-400">Main line: </span>
              <span className="text-white font-mono">
                {analysis.principalVariation.slice(0, 5).join(' ')}
                {analysis.principalVariation.length > 5 && '...'}
              </span>
            </div>
          )}
          
          <div className="text-sm">
            <span className="text-gray-400">Depth: </span>
            <span className="text-white">{analysis.depth}</span>
          </div>
        </div>
      )}

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Move History</h4>
          <div className="max-h-32 overflow-y-auto bg-slate-900/50 rounded-lg p-2">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => goToMove(-1)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentMoveIndex === -1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Start
              </button>
              {moveHistory.map((move, index) => {
                const moveNumber = Math.floor(index / 2) + 1;
                const isWhiteMove = index % 2 === 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => goToMove(index)}
                    className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
                      currentMoveIndex === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {isWhiteMove && `${moveNumber}.`} {move}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessAnalysisBoard;
