import React from 'react';
import { Chessboard } from 'react-chessboard';

const SimpleDropTest = () => {
  const onDrop = (sourceSquare, targetSquare) => {
    console.log('*** DROP TEST *** - onDrop called:', { sourceSquare, targetSquare });
    alert(`Move attempted: ${sourceSquare} to ${targetSquare}`);
    return true; // Allow all moves for testing
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Drop Test</h1>
      <p className="mb-4">Try to move any piece. You should see console logs and alerts.</p>
      <div className="flex justify-center">
        <Chessboard
          position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          onPieceDrop={onDrop}
          boardWidth={400}
        />
      </div>
    </div>
  );
};

export default SimpleDropTest;
