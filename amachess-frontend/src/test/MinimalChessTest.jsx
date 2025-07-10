import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const MinimalChessTest = () => {
  const [position, setPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  const onDrop = (sourceSquare, targetSquare) => {
    console.log('Minimal test - onDrop called:', { sourceSquare, targetSquare });
    
    // For now, just allow any move to test the UI
    const chess = new Chess(position);
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen
      });
      
      if (move) {
        console.log('Move successful:', move);
        setPosition(chess.fen());
        return true;
      }
    } catch (error) {
      console.log('Move failed:', error);
    }
    
    return false;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Chess Test</h1>
      <div className="flex justify-center">
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardWidth={400}
        />
      </div>
      <p className="mt-4 text-center">Current position: {position}</p>
    </div>
  );
};

export default MinimalChessTest;
