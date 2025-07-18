import React, { useState, useRef } from 'react';
import { chessVisionService } from '../services/chessVisionService';
import type { ChessBoundingBox } from '../services/chessVisionService';

interface ChessPDFViewerProps {
  pdfUrl: string;
  pdfFile?: File;
  className?: string;
  onChessBoardClick?: (fen: string, boundingBox: ChessBoundingBox) => void;
}

const ChessPDFViewer: React.FC<ChessPDFViewerProps> = ({ 
  pdfUrl, 
  pdfFile, 
  className = '', 
  onChessBoardClick 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [detectingChess, setDetectingChess] = useState(false);
  const [chessBoards, setChessBoards] = useState<ChessBoundingBox[]>([]);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF. Please try again.');
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const detectChessBoards = async (maxPages?: number, startPage?: number) => {
    if (!pdfFile) {
      setError('No PDF file available for chess board detection');
      return;
    }

    setDetectingChess(true);
    setError(null);
    
    try {
      console.log('Detecting chess boards in PDF...', { maxPages, startPage });
      
      // Show progress message
      const progressMessage = maxPages 
        ? `Processing ${maxPages} pages starting from page ${startPage || 1}...`
        : 'Processing all pages...';
      
      console.log(progressMessage);
      
      const boundingBoxes = await chessVisionService.detectChessBoards(pdfFile, maxPages, startPage);
      console.log('Chess boards detected:', boundingBoxes);
      
      setChessBoards(boundingBoxes);
      setShowBoundingBoxes(true);
      
      // Show success message
      const successMessage = `Found ${boundingBoxes.length} chess boards${maxPages ? ` in ${maxPages} pages` : ''}`;
      console.log(successMessage);
      
    } catch (err: any) {
      console.error('Error detecting chess boards:', err);
      
      if (err.message.includes('timeout')) {
        setError('PDF processing timed out. Try processing fewer pages at once or check if the PDF is too large.');
      } else if (err.message.includes('Python service')) {
        setError('Chess detection service is unavailable. Please make sure the Python service is running.');
      } else {
        setError(err.message || 'Failed to detect chess boards. Please try again.');
      }
    } finally {
      setDetectingChess(false);
    }
  };

  const handleChessBoardClick = async (boundingBox: ChessBoundingBox) => {
    if (!onChessBoardClick) return;

    try {
      console.log('Extracting FEN from bounding box:', boundingBox);
      const fen = await chessVisionService.extractFenFromCoordinates(
        boundingBox.page,
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );
      console.log('FEN extracted:', fen);
      onChessBoardClick(fen, boundingBox);
    } catch (err) {
      console.error('Error extracting FEN:', err);
      setError('Failed to extract chess position. Please try again.');
    }
  };

  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(!showBoundingBoxes);
  };

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-[#121621]">
        <p className="text-gray-400">No PDF available</p>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container h-full flex flex-col bg-[#121621] ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-[#1a1f2e] border-b border-[#374162]">
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">Zoom:</span>
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="px-2 py-1 bg-[#374162] text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="px-2 py-1 bg-[#374162] text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 text-sm"
          >
            Reset
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Chess Detection Controls */}
          <button
            onClick={() => detectChessBoards(10, 1)} // Start with first 10 pages
            disabled={detectingChess || !pdfFile}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {detectingChess ? 'Detecting...' : 'Detect Chess Boards'}
          </button>
          
          {/* Additional processing options */}
          <button
            onClick={() => detectChessBoards()} // Process all pages
            disabled={detectingChess || !pdfFile}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {detectingChess ? 'Processing...' : 'All Pages'}
          </button>
          
          {chessBoards.length > 0 && (
            <button
              onClick={toggleBoundingBoxes}
              className={`px-3 py-1 rounded text-sm ${
                showBoundingBoxes 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {showBoundingBoxes ? 'Hide Boards' : 'Show Boards'} ({chessBoards.length})
            </button>
          )}
          
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Open in New Tab
          </a>
          <a
            href={pdfUrl}
            download
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Download
          </a>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121621] z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <span className="text-white">Loading PDF...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121621] z-10">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="h-full w-full overflow-auto">
          <div 
            className="h-full w-full flex justify-center relative"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              minHeight: `${100 / scale}%`
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              width="100%"
              height="100%"
              className="border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Viewer"
              style={{ 
                display: loading ? 'none' : 'block',
                minHeight: '600px',
                border: 'none',
                backgroundColor: '#fff'
              }}
            />
            
            {/* Chess Board Bounding Boxes Overlay */}
            {showBoundingBoxes && chessBoards.length > 0 && (
              <div 
                ref={overlayRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: `scale(${1/scale})`,
                  transformOrigin: 'top center',
                }}
              >
                {chessBoards.map((board, index) => (
                  <div
                    key={`board-${index}`}
                    className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 cursor-pointer hover:bg-opacity-30 pointer-events-auto"
                    style={{
                      left: `${board.x}px`,
                      top: `${board.y}px`,
                      width: `${board.width}px`,
                      height: `${board.height}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left'
                    }}
                    onClick={() => handleChessBoardClick(board)}
                    title={`Chess board on page ${board.page} (confidence: ${board.confidence || 'N/A'})`}
                  >
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-br">
                      Page {board.page}
                      {board.confidence && (
                        <span className="ml-1">({(board.confidence * 100).toFixed(0)}%)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessPDFViewer;
