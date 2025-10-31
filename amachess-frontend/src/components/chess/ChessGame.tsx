import React, { useRef, useState, useEffect } from 'react';
import ChessBoard, { ChessBoardRef } from './ChessBoard';
import { useChessGame } from '../../hooks/useChessGame';
import { stockfishAPI } from '../../utils/stockfish';
import './ChessGame.css';

// Define the type locally to avoid import issues
type GameDifficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface ChessGameProps {
  isModalMode?: boolean;
  position?: string;
  onMove?: (move: { from: string; to: string; san?: string }) => boolean | void;
  interactive?: boolean;
  showNotation?: boolean;
  engineEnabled?: boolean;
  orientation?: 'white' | 'black';
}

const ChessGame: React.FC<ChessGameProps> = ({
  isModalMode = false,
  position: externalPosition,
  onMove: externalOnMove,
  interactive = true,
  showNotation = false,
  engineEnabled = true,
  orientation = 'white'
}) => {
  const chessBoardRef = useRef<ChessBoardRef>(null);
  const [evaluation, setEvaluation] = useState<{ value: number; type: 'centipawns' | 'mate' } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalyzedPosition = useRef<string>('');
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);
  const analysisRequestId = useRef<number>(0);
  const lastAnalysisTime = useRef<number>(0);
  const MIN_ANALYSIS_INTERVAL = 1000; // Minimum 1 second between analysis requests
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
        analysisTimeout.current = null;
      }
    };
  }, []);
  
  const {
    gameState,
    difficulty,
    isThinking,
    makePlayerMove,
    resetGame,
    changeDifficulty,
  } = useChessGame();

  // Use external position if provided, otherwise use game state
  const currentPosition = externalPosition || gameState.position;
  const moveHistory = gameState.moveHistory;

  // Get position evaluation from Stockfish
  useEffect(() => {
    if (!engineEnabled || gameState.isGameOver || isThinking) return;
    
    // Prevent repeated analysis of the same position
    if (lastAnalyzedPosition.current === currentPosition) return;
    
    // Prevent analysis if already analyzing
    if (isAnalyzing) return;
    
    // Rate limiting - prevent too frequent requests
    const now = Date.now();
    const timeSinceLastAnalysis = now - lastAnalysisTime.current;
    if (timeSinceLastAnalysis < MIN_ANALYSIS_INTERVAL) {
      return;
    }
    
    // Clear any existing timeout
    if (analysisTimeout.current) {
      clearTimeout(analysisTimeout.current);
      analysisTimeout.current = null;
    }
    
    const getEvaluation = async () => {
      const requestId = ++analysisRequestId.current;
      setIsAnalyzing(true);
      lastAnalyzedPosition.current = currentPosition;
      lastAnalysisTime.current = Date.now();
      
      try {
        const result = await stockfishAPI.evaluatePosition(currentPosition, 12);
        
        // Check if this is still the latest request
        if (requestId === analysisRequestId.current && result.evaluation) {
          setEvaluation({
            value: result.evaluation.value,
            type: result.evaluation.type === 'mate' ? 'mate' : 'centipawns'
          });
        }
      } catch (error) {
        // Only log error if this is still the latest request
        if (requestId === analysisRequestId.current) {
          console.log('Could not get evaluation:', error);
        }
      } finally {
        // Only update analyzing state if this is still the latest request
        if (requestId === analysisRequestId.current) {
          setIsAnalyzing(false);
        }
      }
    };

    // Debounce evaluation requests with 1.5 second delay
    analysisTimeout.current = setTimeout(getEvaluation, 1500);
    
    return () => {
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
        analysisTimeout.current = null;
      }
    };
  }, [currentPosition, gameState.isGameOver, isThinking, engineEnabled, isAnalyzing]); // Added isAnalyzing back to dependencies

  const handleMove = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string; piece: string }) => {
    // If external move handler is provided, use it
    if (externalOnMove) {
      const moveObj = { from: sourceSquare, to: targetSquare };
      const result = externalOnMove(moveObj);
      
      // If the external handler returns a boolean, use it; if void, default to true (legacy behavior)
      return result !== false;
    }

    // Only allow moves when it's the player's turn and not thinking
    if (!gameState.isPlayerTurn || isThinking || gameState.isGameOver || !targetSquare) {
      return false;
    }
    
    const success = makePlayerMove(sourceSquare, targetSquare);
    
    // Play move sound if successful (remove the audio for now to avoid 416 error)
    if (success) {
      // Audio removed to avoid console errors
      console.log('Move sound would play here');
    }
    
    return success;
  };

  const getGameStatusMessage = () => {
    if (gameState.isGameOver) {
      switch (gameState.gameResult) {
        case 'checkmate':
          return `Checkmate! ${gameState.winner === 'white' ? 'You win!' : 'Computer wins!'}`;
        case 'stalemate':
          return 'Stalemate! Game is a draw.';
        case 'draw':
          return 'Game is a draw.';
        default:
          return 'Game over.';
      }
    }
    
    if (isThinking) {
      return 'Computer is thinking...';
    }
    
    return gameState.isPlayerTurn ? 'Your turn' : 'Computer\'s turn';
  };

  const difficultyOptions: GameDifficulty[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Modal mode renders a compact version
  if (isModalMode) {
    return (
      <div className="chess-game-modal">
        <div className="modal-game-layout">
          <div className="modal-chessboard-container">
            <ChessBoard
              ref={chessBoardRef}
              position={currentPosition}
              onMove={handleMove}
              orientation={orientation}
              disabled={!interactive}
              animationDuration={200}
              highlightLastMove={true}
              showCoordinates={false}
              showEvaluation={false}
            />
          </div>
          
          {showNotation && moveHistory.length > 0 && (
            <div className="modal-move-history">
              <div className="modal-moves">
                {moveHistory.slice(-6).map((move: string, index: number) => {
                  const actualIndex = moveHistory.length - 6 + index;
                  return (
                    <span key={actualIndex} className="modal-move">
                      {actualIndex % 2 === 0 && `${Math.floor(actualIndex / 2) + 1}. `}
                      {move}
                      {actualIndex % 2 === 1 ? ' ' : ' '}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular full-page mode
  return (
    <div className="chess-game">
      <div className="game-header">
        <h1>Chess vs Computer</h1>
        <div className="game-controls">
          <div className="difficulty-control">
            <label htmlFor="difficulty">Difficulty: </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => changeDifficulty(Number(e.target.value) as GameDifficulty)}
              disabled={!gameState.isPlayerTurn || isThinking}
            >
              {difficultyOptions.map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={resetGame}
            className="reset-button"
            disabled={isThinking}
          >
            New Game
          </button>
        </div>
      </div>

      <div className="game-status">
        <h2>{getGameStatusMessage()}</h2>
      </div>

      <div className="chessboard-container">
        <ChessBoard
          ref={chessBoardRef}
          position={currentPosition}
          onMove={handleMove}
          orientation={orientation}
          disabled={!gameState.isPlayerTurn || isThinking || gameState.isGameOver}
          animationDuration={200}
          highlightLastMove={true}
          showCoordinates={true}
          showEvaluation={true}
          evaluation={evaluation}
        />
      </div>

      {moveHistory.length > 0 && (
        <div className="move-history">
          <h3>Move History</h3>
          <div className="moves">
            {moveHistory.map((move: string, index: number) => (
              <span key={index} className="move">
                {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
                {move}
                {index % 2 === 1 ? ' ' : ' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;

