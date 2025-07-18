import React, { useRef, useState } from 'react';
import PDFChessViewer, { ChessBoundingBox } from './PDFChessViewer';
import ChessBoard, { ChessBoardRef } from './ChessBoard';
import { Chess } from 'chess.js';

interface ChessBookReaderProps {
  pdfUrl: string;
  bookTitle?: string;
  className?: string;
}

const ChessBookReader: React.FC<ChessBookReaderProps> = ({
  pdfUrl,
  bookTitle = 'Chess Book',
  className = ''
}) => {
  const chessBoardRef = useRef<ChessBoardRef>(null);
  const [currentPosition, setCurrentPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [selectedBoundingBox, setSelectedBoundingBox] = useState<ChessBoundingBox | null>(null);
  const [detectedFen, setDetectedFen] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle FEN detection from PDF
  const handleFenDetected = (fen: string, boundingBox: ChessBoundingBox) => {
    console.log('FEN detected:', fen);
    console.log('Bounding box:', boundingBox);
    
    // Validate FEN
    try {
      const chess = new Chess(fen);
      setCurrentPosition(chess.fen());
      setDetectedFen(fen);
      setSelectedBoundingBox(boundingBox);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Invalid FEN detected:', error);
      setIsAnalyzing(false);
    }
  };

  // Handle chess board moves
  const handleChessMove = () => {
    if (chessBoardRef.current) {
      const newPosition = chessBoardRef.current.getPosition();
      setCurrentPosition(newPosition);
    }
    return true;
  };

  // Reset to starting position
  const resetBoard = () => {
    if (chessBoardRef.current) {
      chessBoardRef.current.resetBoard();
      setCurrentPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      setDetectedFen(null);
      setSelectedBoundingBox(null);
    }
  };

  // Copy FEN to clipboard
  const copyFenToClipboard = () => {
    if (detectedFen) {
      navigator.clipboard.writeText(detectedFen);
      // Could add a toast notification here
    }
  };

  return (
    <div className={`chess-book-reader h-full flex ${className}`}>
      {/* PDF Viewer with Chess Detection */}
      <div className="flex-1 border-r border-gray-300">
        <PDFChessViewer
          pdfUrl={pdfUrl}
          onFenDetected={handleFenDetected}
          chessBoardRef={chessBoardRef}
          showBoundingBoxes={true}
          autoDetectChess={false}
          className="h-full"
        />
      </div>

      {/* Chess Board and Analysis Panel */}
      <div className="w-96 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{bookTitle}</h2>
          <p className="text-sm text-gray-600">Interactive Chess Reader</p>
        </div>

        {/* Chess Board */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Chess Position</h3>
            <div className="aspect-square max-w-full">
              <ChessBoard
                ref={chessBoardRef}
                position={currentPosition}
                onMove={handleChessMove}
                orientation="white"
                disabled={false}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-2">
            <button
              onClick={resetBoard}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Reset Board
            </button>
            
            {detectedFen && (
              <button
                onClick={copyFenToClipboard}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Copy FEN
              </button>
            )}
          </div>

          {/* Position Info */}
          {selectedBoundingBox && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <h4 className="font-medium text-gray-700 mb-2">Detected Position</h4>
              <div className="space-y-1 text-gray-600">
                <p>Page: {selectedBoundingBox.page}</p>
                <p>Location: ({selectedBoundingBox.x}, {selectedBoundingBox.y})</p>
                <p>Size: {selectedBoundingBox.width} × {selectedBoundingBox.height}</p>
                {selectedBoundingBox.confidence && (
                  <p>Confidence: {(selectedBoundingBox.confidence * 100).toFixed(1)}%</p>
                )}
              </div>
            </div>
          )}

          {/* FEN Display */}
          {detectedFen && (
            <div className="mt-4 p-3 bg-green-50 rounded text-sm">
              <h4 className="font-medium text-green-700 mb-2">FEN Notation</h4>
              <code className="text-xs text-green-600 break-all">
                {detectedFen}
              </code>
            </div>
          )}

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600">Analyzing position...</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-700 mb-2">How to Use</h4>
          <ol className="text-xs text-gray-600 space-y-1">
            <li>1. Click "Detect Chess" to find diagrams on the current page</li>
            <li>2. Click on highlighted boxes to extract the position</li>
            <li>3. The chess board will update to show the detected position</li>
            <li>4. Use the board to analyze and play moves</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ChessBookReader;
