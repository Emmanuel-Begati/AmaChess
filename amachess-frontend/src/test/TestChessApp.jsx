import React, { useState } from 'react';
import ChessBoard from '../components/ChessBoard';
import ImprovedStockfishGame from '../components/ImprovedStockfishGame';
import StockfishIntegration from './StockfishIntegration';

const TestChessApp = () => {
  const [activeComponent, setActiveComponent] = useState('basic');

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AmaChess Component Tests</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveComponent('basic')}
            className={`px-4 py-2 rounded-lg ${
              activeComponent === 'basic' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Basic Chess Board
          </button>
          <button
            onClick={() => setActiveComponent('stockfish')}
            className={`px-4 py-2 rounded-lg ${
              activeComponent === 'stockfish' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Improved Stockfish
          </button>
          <button
            onClick={() => setActiveComponent('integration')}
            className={`px-4 py-2 rounded-lg ${
              activeComponent === 'integration' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Stockfish Integration
          </button>
        </div>
      </header>

      <main>
        {activeComponent === 'basic' && <BasicChessBoard />}
        {activeComponent === 'stockfish' && <ImprovedStockfishGame />}
        {activeComponent === 'integration' && <StockfishIntegration />}
      </main>
    </div>
  );
};

// Basic ChessBoard test component
const BasicChessBoard = () => {
  const [position, setPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [moves, setMoves] = useState([]);

  const handleMove = (move, newFen) => {
    console.log('Move made:', move);
    console.log('New position:', newFen);
    
    setPosition(newFen);
    setMoves(prev => [...prev, move]);
    
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Basic Chess Board Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ChessBoard 
            position={position} 
            onMove={handleMove}
            showNotation={true}
          />
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold text-xl mb-3">Current State</h3>
          <p className="mb-2 text-sm font-mono">{position}</p>
          
          <h3 className="font-bold text-lg mt-4 mb-2">Move History</h3>
          <div className="max-h-96 overflow-y-auto">
            {moves.length === 0 ? (
              <p className="text-gray-400">No moves yet</p>
            ) : (
              <ol className="list-decimal pl-5">
                {moves.map((move, i) => (
                  <li key={i} className="mb-1">
                    <span className="font-semibold">{move.san}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({move.from}-{move.to})
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChessApp;
