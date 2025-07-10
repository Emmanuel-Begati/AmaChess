import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../hooks/useChessGame';
import type { GameDifficulty } from '../types/chess';
import './ChessGame.css';

const ChessGame: React.FC = () => {
  const {
    gameState,
    difficulty,
    isThinking,
    makePlayerMove,
    resetGame,
    changeDifficulty,
  } = useChessGame();

  const onPieceDrop = ({ sourceSquare, targetSquare }: any) => {
    // Only allow moves when it's the player's turn and not thinking
    if (!gameState.isPlayerTurn || isThinking || gameState.isGameOver || !targetSquare) {
      return false;
    }
    
    return makePlayerMove(sourceSquare, targetSquare);
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
        <Chessboard
          options={{
            position: gameState.position,
            onPieceDrop,
            boardOrientation: "white",
            animationDurationInMs: 200,
          }}
        />
      </div>

      {gameState.moveHistory.length > 0 && (
        <div className="move-history">
          <h3>Move History</h3>
          <div className="moves">
            {gameState.moveHistory.map((move, index) => (
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
