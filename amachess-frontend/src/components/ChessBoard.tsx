import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

export interface ChessBoardRef {
  getPosition: () => string;
  makeMove: (move: string) => boolean;
  resetBoard: () => void;
  highlightSquares: (squares: string[]) => void;
  clearHighlights: () => void;
}

interface ChessBoardProps {
  position?: string;
  onMove?: (moveDetails: {
    sourceSquare: string;
    targetSquare: string;
    piece: string;
  }) => Promise<boolean> | boolean;
  orientation?: 'white' | 'black';
  disabled?: boolean;
  showCoordinates?: boolean;
  animationDuration?: number;
  customSquareStyles?: Record<string, React.CSSProperties>;
  highlightLastMove?: boolean;
  showEvaluation?: boolean;
  evaluation?: {
    value: number;
    type: 'centipawns' | 'mate';
  } | null;
  allowAllMoves?: boolean;
  arePremovesAllowed?: boolean;
  className?: string;
}

const ChessBoard = forwardRef<ChessBoardRef, ChessBoardProps>(({
  position = 'start',
  onMove,
  orientation = 'white',
  disabled = false,
  animationDuration = 200,
  customSquareStyles = {},
  highlightLastMove = true,
  showEvaluation = false,
  evaluation = null,
  className = ''
}, ref) => {
  const gameRef = useRef(new Chess());
  const lastMoveRef = useRef<{ from: string; to: string } | null>(null);

  // Update game position when position prop changes
  React.useEffect(() => {
    try {
      gameRef.current.load(position);
    } catch (error) {
      console.error('Invalid FEN position:', position);
    }
  }, [position]);

  useImperativeHandle(ref, () => ({
    getPosition: () => gameRef.current.fen(),
    makeMove: (move: string) => {
      try {
        const result = gameRef.current.move(move);
        return !!result;
      } catch {
        return false;
      }
    },
    resetBoard: () => {
      gameRef.current.reset();
      lastMoveRef.current = null;
    },
    highlightSquares: (squares: string[]) => {
      // This could be implemented to highlight specific squares
      console.log('Highlighting squares:', squares);
    },
    clearHighlights: () => {
      // Clear any highlights
      console.log('Clearing highlights');
    }
  }));

  const handlePieceDrop = ({ sourceSquare, targetSquare, piece }: any) => {
    if (disabled || !targetSquare) return false;

    // Check if move is legal
    const gameCopy = new Chess(gameRef.current.fen());
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (!move) return false;

      // Update last move for highlighting
      lastMoveRef.current = { from: sourceSquare, to: targetSquare };

      // Play move sound (if available)
      try {
        const audio = new Audio('/move-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio errors
        });
      } catch (error) {
        // Ignore audio errors
      }

      // Call the onMove callback
      if (onMove) {
        const moveDetails = {
          sourceSquare,
          targetSquare,
          piece
        };
        
        const result = onMove(moveDetails);
        
        // Handle async result
        if (result instanceof Promise) {
          result.then((success) => {
            if (success) {
              gameRef.current = gameCopy;
            } else {
              // Reset to original position on incorrect move
              gameRef.current.load(position);
            }
          });
          return true; // Allow the move temporarily
        } else {
          if (result) {
            gameRef.current = gameCopy;
            return true;
          } else {
            // For incorrect moves, reset the position after a brief moment
            // This ensures the board stays in sync with the external position
            setTimeout(() => {
              try {
                gameRef.current.load(position);
              } catch (error) {
                console.error('Error resetting position:', error);
              }
            }, 100);
            return false;
          }
        }
      }

      // If no onMove callback, just update the game
      gameRef.current = gameCopy;
      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  };

  // Combine custom styles with last move highlighting
  const combinedSquareStyles = React.useMemo(() => {
    const styles = { ...customSquareStyles };
    
    if (highlightLastMove && lastMoveRef.current) {
      styles[lastMoveRef.current.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        ...styles[lastMoveRef.current.from]
      };
      styles[lastMoveRef.current.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        ...styles[lastMoveRef.current.to]
      };
    }
    
    return styles;
  }, [customSquareStyles, highlightLastMove]);

  const formatEvaluation = (evalData: typeof evaluation) => {
    if (!evalData) return '';
    
    if (evalData.type === 'mate') {
      return `Mate in ${Math.abs(evalData.value)}`;
    }
    
    const pawns = evalData.value / 100;
    return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
  };

  const getEvaluationColor = (evalData: typeof evaluation) => {
    if (!evalData) return '#666';
    
    if (evalData.type === 'mate') {
      return evalData.value > 0 ? '#4CAF50' : '#f44336';
    }
    
    if (evalData.value > 50) return '#4CAF50';
    if (evalData.value < -50) return '#f44336';
    return '#666';
  };

  return (
    <div className={`chess-board-wrapper ${className}`}>
      {showEvaluation && evaluation && (
        <div className="evaluation-bar" style={{
          padding: '8px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '8px',
          color: getEvaluationColor(evaluation),
          fontWeight: 'bold'
        }}>
          Evaluation: {formatEvaluation(evaluation)}
        </div>
      )}
      
      <Chessboard
        options={{
          position,
          onPieceDrop: handlePieceDrop,
          boardOrientation: orientation,
          animationDurationInMs: animationDuration,
          squareStyles: combinedSquareStyles,
        }}
      />
      
      {disabled && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';

export default ChessBoard;
