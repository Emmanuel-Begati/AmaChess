import React, { useRef, useState } from 'react';
import { Chess } from 'chess.js';
import PDFChessViewer, { ChessBoundingBox } from './PDFChessViewer';
import ChessBoard, { ChessBoardRef } from './ChessBoard';

/**
 * Example component demonstrating PDF Chess Bounding Box functionality
 * 
 * This component shows how to:
 * 1. Set up a PDF viewer with chess detection
 * 2. Handle bounding box clicks to extract FEN
 * 3. Update a chess board with the detected position
 * 4. Provide visual feedback during processing
 */

const ChessBookAnalyzer: React.FC = () => {
  const chessBoardRef = useRef<ChessBoardRef>(null);
  const [currentFen, setCurrentFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [detectedPosition, setDetectedPosition] = useState<string>('');
  const [selectedBoundingBox, setSelectedBoundingBox] = useState<ChessBoundingBox | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle FEN detection from PDF bounding box click
  const handleFenDetected = async (fen: string, boundingBox: ChessBoundingBox) => {
    console.log('FEN detected from bounding box:', fen);
    console.log('Bounding box details:', boundingBox);
    
    // Validate the FEN
    try {
      const chess = new Chess(fen);
      setCurrentFen(fen);
      setDetectedPosition(chess.ascii());
      setSelectedBoundingBox(boundingBox);
      setAnalysisResult(''); // Clear previous analysis
      
      // Optional: Auto-analyze the position
      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          setAnalysisResult('Position shows checkmate!');
        } else if (chess.isStalemate()) {
          setAnalysisResult('Position shows stalemate.');
        } else {
          setAnalysisResult('Game is over.');
        }
      } else {
        setAnalysisResult(`Position detected. ${chess.turn() === 'w' ? 'White' : 'Black'} to move.`);
      }
    } catch (error) {
      console.error('Invalid FEN detected:', error);
      setAnalysisResult('Invalid chess position detected.');
    }
  };

  // Reset to starting position
  const resetToStartingPosition = () => {
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    setCurrentFen(startingFen);
    setDetectedPosition('');
    setSelectedBoundingBox(null);
    setAnalysisResult('');
    
    if (chessBoardRef.current) {
      chessBoardRef.current.resetBoard();
    }
  };

  // Analyze position with Stockfish (if available)
  const analyzePosition = async () => {
    if (!currentFen || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: currentFen,
          depth: 15,
          time: 2000
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const evaluation = data.analysis.evaluation;
        
        let evalText = '';
        if (evaluation.type === 'mate') {
          evalText = `Mate in ${Math.abs(evaluation.value)} moves`;
        } else {
          const centipawns = evaluation.value / 100;
          evalText = `Evaluation: ${centipawns > 0 ? '+' : ''}${centipawns.toFixed(2)}`;
        }
        
        setAnalysisResult(`${evalText} | Best move: ${data.analysis.bestMove}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult('Analysis failed. Make sure Stockfish service is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="chess-book-analyzer h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Chess Book Analyzer</h1>
        <p className="text-gray-600 mt-1">
          Click on detected chess diagrams in the PDF to analyze positions
        </p>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer with Chess Detection */}
        <div className="flex-1 border-r border-gray-300">
          <PDFChessViewer
            pdfUrl="/path/to/your/chess-book.pdf" // Replace with actual PDF path
            onFenDetected={handleFenDetected}
            chessBoardRef={chessBoardRef}
            showBoundingBoxes={true}
            autoDetectChess={true}
            className="h-full"
          />
        </div>
        
        {/* Chess Board and Analysis Panel */}
        <div className="w-1/3 flex flex-col bg-gray-50">
          {/* Chess Board */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Position</h2>
              <button
                onClick={resetToStartingPosition}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                Reset
              </button>
            </div>
            
            <div className="max-w-xs mx-auto">
              <ChessBoard
                ref={chessBoardRef}
                position={currentFen}
                showCoordinates={true}
                disabled={true} // Read-only for analysis
                className="shadow-md rounded-lg"
              />
            </div>
          </div>
          
          {/* Analysis Panel */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Analysis</h3>
                <button
                  onClick={analyzePosition}
                  disabled={isAnalyzing || !currentFen}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              
              {analysisResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">{analysisResult}</p>
                </div>
              )}
            </div>
            
            {/* Position Details */}
            {selectedBoundingBox && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Detection Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Page:</strong> {selectedBoundingBox.page}</p>
                  <p><strong>Position:</strong> ({selectedBoundingBox.x}, {selectedBoundingBox.y})</p>
                  <p><strong>Size:</strong> {selectedBoundingBox.width} × {selectedBoundingBox.height}</p>
                  <p><strong>Confidence:</strong> {((selectedBoundingBox.confidence || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}
            
            {/* FEN Display */}
            {currentFen && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">FEN</h4>
                <div className="p-2 bg-gray-100 rounded text-xs font-mono break-all">
                  {currentFen}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(currentFen)}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
            
            {/* ASCII Board Display */}
            {detectedPosition && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">ASCII Board</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded font-mono overflow-x-auto">
                  {detectedPosition}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {selectedBoundingBox 
              ? `Selected diagram from page ${selectedBoundingBox.page}` 
              : 'Click on a chess diagram to analyze'
            }
          </span>
          <span className="text-xs">
            {isAnalyzing ? 'Analyzing position...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChessBookAnalyzer;
