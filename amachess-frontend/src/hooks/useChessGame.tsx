import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import type { GameState, GameDifficulty } from '../types/chess';
import { StockfishEngine } from '../utils/stockfish';

export const useChessGame = () => {
  const [game] = useState(() => new Chess());
  const [gameState, setGameState] = useState<GameState>({
    position: game.fen(),
    isGameOver: false,
    isPlayerTurn: true,
    moveHistory: [],
  });
  const [difficulty, setDifficulty] = useState<GameDifficulty>(5);
  const [isThinking, setIsThinking] = useState(false);
  
  const engineRef = useRef<StockfishEngine | null>(null);

  useEffect(() => {
    engineRef.current = new StockfishEngine();
    engineRef.current.setDifficulty(difficulty);

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [difficulty]);

  const updateGameState = useCallback(() => {
    const isGameOver = game.isGameOver();
    let gameResult: GameState['gameResult'];
    let winner: GameState['winner'];

    if (isGameOver) {
      if (game.isCheckmate()) {
        gameResult = 'checkmate';
        winner = game.turn() === 'w' ? 'black' : 'white';
      } else if (game.isStalemate()) {
        gameResult = 'stalemate';
        winner = 'draw';
      } else if (game.isDraw()) {
        gameResult = 'draw';
        winner = 'draw';
      }
    }

    setGameState({
      position: game.fen(),
      isGameOver,
      isPlayerTurn: game.turn() === 'w',
      gameResult,
      winner,
      moveHistory: game.history(),
    });
  }, [game]);

  const makePlayerMove = useCallback((from: string, to: string) => {
    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (move) {
        updateGameState();
        
        // If it's now the computer's turn and game isn't over
        if (game.turn() === 'b' && !game.isGameOver()) {
          setIsThinking(true);
          
          // Get computer move
          if (engineRef.current) {
            engineRef.current.getBestMove(game.fen(), (moveString) => {
              if (moveString === 'random') {
                // Make a random legal move
                const possibleMoves = game.moves();
                if (possibleMoves.length > 0) {
                  const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                  game.move(randomMove);
                  updateGameState();
                }
              } else {
                // Parse UCI move format (e.g., "e2e4") and convert to chess.js format
                try {
                  const from = moveString.substring(0, 2);
                  const to = moveString.substring(2, 4);
                  const promotion = moveString.length > 4 ? moveString.substring(4) : undefined;
                  
                  const moveObject: any = { from, to };
                  if (promotion) {
                    moveObject.promotion = promotion;
                  }
                  
                  const move = game.move(moveObject);
                  if (move) {
                    updateGameState();
                  } else {
                    throw new Error('Invalid move from engine');
                  }
                } catch (error) {
                  console.error('Invalid engine move:', error);
                  // Fallback to random move
                  const possibleMoves = game.moves();
                  if (possibleMoves.length > 0) {
                    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    game.move(randomMove);
                    updateGameState();
                  }
                }
              }
              setIsThinking(false);
            });
          }
        }
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  }, [game, updateGameState]);

  const resetGame = useCallback(() => {
    game.reset();
    updateGameState();
    setIsThinking(false);
  }, [game, updateGameState]);

  const changeDifficulty = useCallback((newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    if (engineRef.current) {
      engineRef.current.setDifficulty(newDifficulty);
    }
  }, []);

  return {
    gameState,
    difficulty,
    isThinking,
    makePlayerMove,
    resetGame,
    changeDifficulty,
  };
};
