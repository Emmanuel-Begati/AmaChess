import React, { useState, useEffect } from 'react';
import { booksApiService, ChessPosition, ChessDiagram } from '../services/booksApi';

interface BookPositionsPanelProps {
  selectedBookId?: string | undefined;
  onPositionClick?: (fen: string, description?: string) => void;
  className?: string;
}

const BookPositionsPanel: React.FC<BookPositionsPanelProps> = ({
  selectedBookId,
  onPositionClick,
  className = ''
}) => {
  const [positions, setPositions] = useState<ChessPosition[]>([]);
  const [diagrams, setDiagrams] = useState<ChessDiagram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'diagrams'>('positions');

  // Load positions and diagrams for selected book
  useEffect(() => {
    const loadBookChessContent = async () => {
      if (!selectedBookId) {
        setPositions([]);
        setDiagrams([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load positions
        const bookPositions = await booksApiService.getBookPositions(selectedBookId);
        setPositions(bookPositions || []);

        // Load diagrams
        const bookDiagrams = await booksApiService.getBookDiagrams(selectedBookId);
        setDiagrams(bookDiagrams || []);

      } catch (error) {
        console.error('Error loading chess content:', error);
        setError('Failed to load chess positions');
      } finally {
        setLoading(false);
      }
    };

    loadBookChessContent();
  }, [selectedBookId]);

  const handlePositionClick = (fen: string, context?: string) => {
    if (onPositionClick) {
      onPositionClick(fen, context);
    }
  };

  const totalContent = positions.length + diagrams.length;

  if (!selectedBookId) {
    return (
      <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Chess Positions</h3>
        <div className="text-center text-gray-400 py-8">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">Select a book to see its chess positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Chess Positions</h3>
        {totalContent > 0 && (
          <span className="text-sm text-gray-400">
            {totalContent} found
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
          <span className="text-gray-400">Loading positions...</span>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 py-8">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && totalContent === 0 && (
        <div className="text-center text-gray-400 py-8">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No chess positions found in this book</p>
        </div>
      )}

      {!loading && !error && totalContent > 0 && (
        <>
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('positions')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'positions'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab('diagrams')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'diagrams'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Diagrams ({diagrams.length})
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {activeTab === 'positions' && positions.map((position, index) => (
              <div
                key={`pos-${position.id || index}`}
                onClick={() => handlePositionClick(position.fen, position.context)}
                className="p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors border border-slate-700/50 hover:border-blue-500/50"
              >
                <div className="flex items-start gap-3">
                  {/* Mini Chess Board Preview */}
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded flex items-center justify-center text-slate-800 font-bold text-xs flex-shrink-0">
                    ♛
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium mb-1">
                      Position #{index + 1}
                    </div>
                    <div className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {position.context || 'Click to analyze this position'}
                    </div>
                    <div className="text-blue-400 text-xs font-mono truncate">
                      {position.fen}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'diagrams' && diagrams.map((diagram, index) => (
              <div
                key={`diag-${diagram.id || index}`}
                onClick={() => diagram.fen && handlePositionClick(diagram.fen, diagram.caption)}
                className={`p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 transition-colors ${
                  diagram.fen ? 'cursor-pointer hover:bg-slate-800/70 hover:border-blue-500/50' : 'opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Mini Chess Board Preview */}
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded flex items-center justify-center text-slate-800 font-bold text-xs flex-shrink-0">
                    📊
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium mb-1">
                      {diagram.caption || `Diagram #${index + 1}`}
                    </div>
                    <div className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {diagram.context || (diagram.fen ? 'Click to analyze this position' : 'No position data available')}
                    </div>
                    {diagram.fen && (
                      <div className="text-blue-400 text-xs font-mono truncate">
                        {diagram.fen}
                      </div>
                    )}
                    {diagram.relatedMoves && diagram.relatedMoves.length > 0 && (
                      <div className="text-green-400 text-xs mt-1">
                        Moves: {diagram.relatedMoves.slice(0, 3).join(', ')}
                        {diagram.relatedMoves.length > 3 && '...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BookPositionsPanel;
