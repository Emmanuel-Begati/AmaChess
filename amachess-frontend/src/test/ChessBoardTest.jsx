import React, { useState } from 'react';
import ChessBoard from '../components/ChessBoard';

const ChessBoardTest = () => {
  const [position, setPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [moveHistory, setMoveHistory] = useState([]);

  const handleMove = (move, newFen) => {
    console.log('Test: Move received:', move, 'New FEN:', newFen);
    setPosition(newFen);
    setMoveHistory(prev => [...prev, move]);
    return true; // Return true to indicate success
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chess Board Test</h1>
      <div className="mb-4">
        <p>Current position: {position}</p>
        <p>Move count: {moveHistory.length}</p>
      </div>
      <ChessBoard 
        position={position}
        onMove={handleMove}
        interactive={true}
        showNotation={true}
        width={400}
      />
      <div className="mt-4">
        <h3 className="font-bold">Move History:</h3>
        <ul>
          {moveHistory.map((move, index) => (
            <li key={index}>{move.san}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChessBoardTest;
