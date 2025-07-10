import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Chess } from 'chess.js';

// Import react-chessboard properly
import { Chessboard } from 'react-chessboard';

const ChessBoard = forwardRef(({ 
  width, 
  position, 
  onMove, 
  interactive = true,
  showNotation = true,
  engineEnabled = false,
  customSquareStyles = {},
  orientation = 'white',
  disabled = false,
  lastMove = null
}, ref) => {
  console.log('ChessBoard component rendering with props:', { 
    width, 
    position: position?.substring(0, 20), 
    interactive, 
    disabled,
    hasChessboard: !!Chessboard
  });

  const [game, setGame] = useState(() => {
    try {
      return new Chess(position || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    } catch (error) {
      console.error('Error creating Chess game:', error);
      return new Chess();
    }
  });
  
  const [gamePosition, setGamePosition] = useState(() => position || game.fen());
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [boardWidth, setBoardWidth] = useState(width || 500);

  // Update game position when position prop changes
  useEffect(() => {
    if (position && position !== gamePosition) {
      console.log('ChessBoard external position update:', position);
      try {
        const newGame = new Chess(position);
        setGame(newGame);
        setGamePosition(position);
        setMoveSquares({});
        setRightClickedSquares({});
        console.log('External position updated successfully');
      } catch (error) {
        console.error('Invalid position provided:', position, error);
      }
    }
  }, [position]);

  // Calculate responsive board width
  useEffect(() => {
    const calculateBoardWidth = () => {
      if (width) {
        setBoardWidth(width);
        return;
      }
      
      const screenWidth = window.innerWidth;
      let newWidth;
      
      if (screenWidth < 475) { // xs
        newWidth = Math.min(screenWidth - 24, 280);
      } else if (screenWidth < 640) { // sm
        newWidth = Math.min(screenWidth - 32, 320);
      } else if (screenWidth < 768) { // md
        newWidth = Math.min(screenWidth - 48, 360);
      } else if (screenWidth < 1024) { // lg
        newWidth = Math.min(screenWidth * 0.5, 400);
      } else { // xl+
        newWidth = 450;
      }
      
      setBoardWidth(newWidth);
    };

    calculateBoardWidth();
    window.addEventListener('resize', calculateBoardWidth);
    return () => window.removeEventListener('resize', calculateBoardWidth);
  }, [width]);

  const makeAMove = useCallback((move) => {
    console.log('makeAMove called with:', move);
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
      console.log('Invalid move:', move, error);
      return null;
    }
    
    if (result) {
      const newPosition = gameCopy.fen();
      console.log('Move successful, new position:', newPosition);
      
      // Update local state first
      setGame(gameCopy);
      setGamePosition(newPosition);
      
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
    console.log('ChessBoard onDrop called:', { sourceSquare, targetSquare, disabled, interactive });
    
    if (disabled || !interactive) {
      console.log('Move blocked: disabled or not interactive');
      return false;
    }
    
    // Clear previous highlights
    setMoveSquares({});
    setRightClickedSquares({});
    
    // Make the move
    const moveResult = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });
    
    if (moveResult) {
      console.log('Move successful:', moveResult);
      
      // Call the onMove callback with move details and new FEN
      if (onMove) {
        console.log('Calling onMove callback');
        try {
          // Get the current position AFTER the move was made
          const currentPosition = new Chess(gamePosition);
          currentPosition.move(moveResult);
          const newFen = currentPosition.fen();
          onMove(moveResult, newFen);
        } catch (error) {
          console.error('Callback error:', error);
        }
      }
      
      return true;
    }
    
    return false;
  }, [makeAMove, onMove, disabled, interactive, gamePosition]);

  // Method to make a move programmatically (for AI moves)
  const makeAIMove = useCallback((moveString) => {
    console.log('Making AI move:', moveString);
    const result = makeAMove(moveString);
    return result;
  }, [makeAMove]);

  // Expose methods through imperative handle
  useImperativeHandle(ref, () => ({
    makeAIMove,
    getCurrentPosition: () => gamePosition,
    getGameObject: () => new Chess(gamePosition)
  }), [makeAIMove, gamePosition]);

  const onSquareClick = useCallback((square) => {
    // Don't show moves if board is disabled
    if (disabled || !interactive) {
      return;
    }

    setRightClickedSquares({});
    
    // Create a fresh game instance from current position to get accurate moves
    const currentGame = new Chess(gamePosition);
    
    // Get possible moves for the clicked square
    const moves = currentGame.moves({
      square: square,
      verbose: true
    });
    
    if (moves.length > 0) {
      const newSquares = {};
      moves.forEach((move) => {
        newSquares[move.to] = {
          background: currentGame.get(move.to) && currentGame.get(move.to).color !== currentGame.get(square).color
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(74, 144, 226, 0.8) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      });
      newSquares[square] = {
        backgroundColor: 'rgba(74, 144, 226, 0.4)'
      };
      setMoveSquares(newSquares);
    } else {
      setMoveSquares({});
    }
  }, [gamePosition, disabled, interactive]);

  const onSquareRightClick = useCallback((square) => {
    const colour = 'rgba(17, 95, 212, 0.8)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }, [rightClickedSquares]);

  // Custom board styling to match your site's theme
  const boardStyles = {
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    border: '2px solid #374162',
    background: 'linear-gradient(145deg, #233248, #374162)',
    padding: '4px'
  };

  // Custom square styles with your color palette
  const combinedSquareStyles = {
    ...moveSquares,
    ...rightClickedSquares,
    ...customSquareStyles
  };

  // Dark square color (matching your site's dark theme)
  const customDarkSquareStyle = { backgroundColor: '#233248' };
  // Light square color (slightly lighter for contrast)
  const customLightSquareStyle = { backgroundColor: '#374162' };

  console.log('Rendering react-chessboard with position:', gamePosition);

  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-4 w-full">
      {/* Main Board Container */}
      <div 
        style={{ maxWidth: `${boardWidth + 8}px` }} 
        className="relative bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-2xl border border-[#374162]/50 w-full"
      >
        {/* Decorative border elements */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] rounded-lg sm:rounded-xl opacity-20 blur-sm"></div>
        
        {/* Board wrapper with inner glow */}
        <div className="relative bg-[#121621] rounded p-0.5 sm:p-1 shadow-inner">
          <Chessboard
            position={gamePosition}
            onPieceDrop={onDrop}
            onSquareClick={interactive && !disabled ? onSquareClick : undefined}
            onSquareRightClick={onSquareRightClick}
            boardWidth={boardWidth}
            showBoardNotation={showNotation}
            customBoardStyle={boardStyles}
            customSquareStyles={combinedSquareStyles}
            customDarkSquareStyle={customDarkSquareStyle}
            customLightSquareStyle={customLightSquareStyle}
            customNotationStyle={{
              fontSize: boardWidth < 320 ? '8px' : boardWidth < 400 ? '10px' : '12px',
              fontWeight: '600',
              color: '#97a1c4'
            }}
            animationDuration={300}
            areArrowsAllowed={true}
            arrowColor='#115fd4'
            boardOrientation={orientation}
          />
        </div>
      </div>
      
      {/* Game Status */}
      {interactive && (
        <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-xl border border-[#374162]/50 w-full max-w-sm">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${game.turn() === 'w' ? 'bg-white' : 'bg-[#374162]'} shadow-sm`}></div>
              <p className="text-[#97a1c4] text-sm font-medium">
                Turn: <span className="text-white font-semibold">{game.turn() === 'w' ? 'White' : 'Black'}</span>
              </p>
            </div>
            
            {/* Game status messages */}
            {game.isCheckmate() && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-2 sm:p-3">
                <p className="text-red-400 font-bold flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Checkmate! {game.turn() === 'w' ? 'Black' : 'White'} wins!
                </p>
              </div>
            )}
            {game.isDraw() && (
              <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-2 sm:p-3">
                <p className="text-yellow-400 font-bold flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Draw!
                </p>
              </div>
            )}
            {game.isCheck() && !game.isCheckmate() && (
              <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-2 sm:p-3">
                <p className="text-orange-400 font-bold flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Check!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Engine Analysis */}
      {engineEnabled && (
        <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-xl border border-[#374162]/50 w-full max-w-md">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-semibold">Engine Analysis</span>
            </div>
            <div className="flex-1 h-1 bg-[#374162] rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <p className="text-[#97a1c4]">Best Move</p>
              <p className="text-white font-bold">Nf3</p>
            </div>
            <div className="text-center">
              <p className="text-[#97a1c4]">Evaluation</p>
              <p className="text-green-400 font-bold">+0.3</p>
            </div>
            <div className="text-center">
              <p className="text-[#97a1c4]">Depth</p>
              <p className="text-blue-400 font-bold">15</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ChessBoard;
