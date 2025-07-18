import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { GameState, GameDifficulty } from '../types/chess';
import { stockfishAPI, type DifficultyLevel } from '../utils/stockfish';

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
  const [isEngineAvailable, setIsEngineAvailable] = useState(false);

  // Map GameDifficulty to DifficultyLevel
  const mapDifficulty = (gameDiff: GameDifficulty): DifficultyLevel => {
    const mapping: Record<GameDifficulty, DifficultyLevel> = {
      1: 'beginner',
      2: 'beginner', 
      3: 'intermediate',
      4: 'intermediate',
      5: 'intermediate',
      6: 'advanced',
      7: 'advanced',
      8: 'expert',
      9: 'expert',
      10: 'maximum'
    };
    return mapping[gameDiff] || 'intermediate';
  };

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const health = await stockfishAPI.checkHealth();
        setIsEngineAvailable(health.status === 'ok');
        console.log('Backend Stockfish service available:', health.status === 'ok');
      } catch (error) {
        console.error('Backend Stockfish service not available:', error);
        setIsEngineAvailable(false);
      }
    };

    checkBackendConnection();
  }, []);

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
          
          const makeComputerMove = async () => {
            try {
              if (isEngineAvailable) {
                console.log('Getting move from backend...');
                const difficultyLevel = mapDifficulty(difficulty);
                const result = await stockfishAPI.getBestMove(game.fen(), difficultyLevel, 3000);
                
                console.log('Received move from Stockfish:', result);
                
                if (result.move && result.move !== '(none)') {
                  // Parse UCI move format (e.g., "e2e4") and convert to chess.js format
                  const from = result.move.substring(0, 2);
                  const to = result.move.substring(2, 4);
                  const promotion = result.move.length > 4 ? result.move.substring(4) : undefined;
                  
                  const moveObject: any = { from, to };
                  if (promotion) {
                    moveObject.promotion = promotion;
                  }
                  
                  console.log('Attempting to make move:', moveObject);
                  const engineMove = game.move(moveObject);
                  if (engineMove) {
                    console.log('Stockfish move successful:', engineMove.san);
                    updateGameState();
                    setIsThinking(false);
                    return;
                  } else {
                    console.warn('Failed to apply Stockfish move:', moveObject);
                  }
                } else {
                  console.warn('Invalid move from Stockfish:', result.move);
                }
              }
              
              // Fallback to random move
              console.log('Using fallback random move');
              const possibleMoves = game.moves();
              if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                if (randomMove) {
                  game.move(randomMove);
                  updateGameState();
                }
              }
            } catch (error) {
              console.error('Error getting computer move:', error);
              // Fallback to random move
              const possibleMoves = game.moves();
              if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                if (randomMove) {
                  game.move(randomMove);
                  updateGameState();
                }
              }
            } finally {
              setIsThinking(false);
            }
          };

          // Add some delay to simulate thinking
          const thinkTime = isEngineAvailable ? 500 : 200 + Math.random() * 800;
          setTimeout(makeComputerMove, thinkTime);
        }
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  }, [game, updateGameState, isEngineAvailable, difficulty]);

  const resetGame = useCallback(() => {
    game.reset();
    updateGameState();
    setIsThinking(false);
  }, [game, updateGameState]);

  const changeDifficulty = useCallback((newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  return {
    gameState,
    difficulty,
    isThinking,
    isEngineAvailable,
    makePlayerMove,
    resetGame,
    changeDifficulty,
  };
};
