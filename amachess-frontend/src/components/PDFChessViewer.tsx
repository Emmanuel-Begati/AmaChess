import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChessBoardRef } from './ChessBoard';
import { chessVisionService } from '../services/chessVisionService';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface ChessBoundingBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
}

interface PDFChessViewerProps {
  pdfUrl: string;
  className?: string;
  onFenDetected?: (fen: string, boundingBox: ChessBoundingBox) => void;
  chessBoardRef?: React.RefObject<ChessBoardRef | null>;
  showBoundingBoxes?: boolean;
  autoDetectChess?: boolean;
}

interface PDFChessViewerRef {
  detectChessOnPage: (pageNumber: number) => Promise<ChessBoundingBox[]>;
  detectChessBoardsFromFile: (pdfFile: File) => Promise<ChessBoundingBox[]>;
  getFenFromBoundingBox: (boundingBox: ChessBoundingBox) => Promise<string>;
  getFenFromCoordinates: (page: number, x: number, y: number, width: number, height: number) => Promise<string>;
  clearBoundingBoxes: () => void;
}

const PDFChessViewer = forwardRef<PDFChessViewerRef, PDFChessViewerProps>(({
  pdfUrl,
  className = '',
  onFenDetected,
  chessBoardRef,
  showBoundingBoxes = true,
  autoDetectChess = false
}, ref) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [boundingBoxes, setBoundingBoxes] = useState<ChessBoundingBox[]>([]);
  const [selectedBox, setSelectedBox] = useState<ChessBoundingBox | null>(null);
  const [processingBox, setProcessingBox] = useState<ChessBoundingBox | null>(null);
  
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    detectChessOnPage: async (pageNumber: number) => {
      try {
        const newBoxes = await chessVisionService.detectChessOnPage(pdfUrl, pageNumber);
        setBoundingBoxes(prev => [
          ...prev.filter(box => box.page !== pageNumber),
          ...newBoxes
        ]);
        return newBoxes;
      } catch (error) {
        console.error('Error detecting chess diagrams:', error);
        return [];
      }
    },
    detectChessBoardsFromFile: async (pdfFile: File) => {
      try {
        const newBoxes = await chessVisionService.detectChessBoards(pdfFile);
        setBoundingBoxes(newBoxes);
        return newBoxes;
      } catch (error) {
        console.error('Error detecting chess boards from file:', error);
        return [];
      }
    },
    getFenFromBoundingBox: async (boundingBox: ChessBoundingBox) => {
      try {
        setProcessingBox(boundingBox);
        const fen = await chessVisionService.extractFenFromBoundingBox(pdfUrl, boundingBox);
        return fen;
      } catch (error) {
        console.error('Error getting FEN from bounding box:', error);
        throw error;
      } finally {
        setProcessingBox(null);
      }
    },
    getFenFromCoordinates: async (page: number, x: number, y: number, width: number, height: number) => {
      try {
        setProcessingBox({ page, x, y, width, height });
        const fen = await chessVisionService.extractFenFromCoordinates(page, x, y, width, height);
        return fen;
      } catch (error) {
        console.error('Error getting FEN from coordinates:', error);
        throw error;
      } finally {
        setProcessingBox(null);
      }
    },
    clearBoundingBoxes: () => {
      setBoundingBoxes([]);
      setSelectedBox(null);
    }
  }));

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  // Handle PDF load error
  const onDocumentLoadError = (error: Error) => {
    setLoading(false);
    setError('Failed to load PDF. Please try again.');
    console.error('PDF load error:', error);
  };

  // Handle page render success
  const onPageRenderSuccess = (pageNumber: number) => {
    if (autoDetectChess && !boundingBoxes.some(box => box.page === pageNumber)) {
      // Auto-detect chess diagrams when page renders
      setTimeout(() => {
        detectChessOnPage(pageNumber);
      }, 500);
    }
  };

  // Detect chess diagrams on a specific page
  const detectChessOnPage = async (pageNumber: number) => {
    try {
      const newBoxes = await chessVisionService.detectChessOnPage(pdfUrl, pageNumber);
      setBoundingBoxes(prev => [
        ...prev.filter(box => box.page !== pageNumber),
        ...newBoxes
      ]);
    } catch (error) {
      console.error('Error detecting chess diagrams:', error);
    }
  };

  // Handle bounding box click - Enhanced version
  const handleBoundingBoxClick = async (boundingBox: ChessBoundingBox) => {
    try {
      setSelectedBox(boundingBox);
      setProcessingBox(boundingBox);
      
      // Send POST request to /api/get-fen with bounding box coordinates
      const fen = await chessVisionService.extractFenFromBoundingBox(pdfUrl, boundingBox);
      
      // Update chess board if ref is provided
      if (chessBoardRef?.current && fen) {
        // Reset board first
        chessBoardRef.current.resetBoard();
        
        // The chess board position should be updated via the parent component
        // using the onFenDetected callback since the board uses a position prop
        if (onFenDetected) {
          onFenDetected(fen, boundingBox);
        }
      }
      
      console.log('FEN detected:', fen);
      console.log('Bounding box:', boundingBox);
    } catch (error) {
      console.error('Error getting FEN from bounding box:', error);
      // Could add user notification here
    } finally {
      setProcessingBox(null);
    }
  };

  // Calculate bounding box style for absolute positioning - Enhanced version
  const getBoundingBoxStyle = (box: ChessBoundingBox, pageNumber: number): React.CSSProperties => {
    const pageElement = pageRefs.current.get(pageNumber);
    if (!pageElement) return {};

    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return {};

    // Calculate scaled dimensions
    const scaledX = (box.x * scale);
    const scaledY = (box.y * scale);
    const scaledWidth = (box.width * scale);
    const scaledHeight = (box.height * scale);

    // Determine border and background colors based on state
    let borderColor = '#3b82f6'; // Default blue
    let backgroundColor = 'rgba(59, 130, 246, 0.1)';
    
    if (selectedBox === box) {
      borderColor = '#10b981'; // Green for selected
      backgroundColor = 'rgba(16, 185, 129, 0.15)';
    } else if (processingBox === box) {
      borderColor = '#f59e0b'; // Amber for processing
      backgroundColor = 'rgba(245, 158, 11, 0.2)';
    }

    return {
      position: 'absolute',
      left: `${scaledX}px`,
      top: `${scaledY}px`,
      width: `${scaledWidth}px`,
      height: `${scaledHeight}px`,
      border: `2px solid ${borderColor}`,
      backgroundColor,
      cursor: processingBox === box ? 'wait' : 'pointer',
      pointerEvents: 'auto',
      borderRadius: '4px',
      transition: 'all 0.2s ease-in-out',
      zIndex: 10,
      boxShadow: selectedBox === box ? '0 0 0 1px rgba(16, 185, 129, 0.5)' : 'none'
    };
  };

  // Render bounding boxes for a specific page - Enhanced version
  const renderBoundingBoxes = (pageNumber: number) => {
    const pageBoxes = boundingBoxes.filter(box => box.page === pageNumber);
    
    return pageBoxes.map((box, index) => (
      <div
        key={`${pageNumber}-${index}`}
        style={getBoundingBoxStyle(box, pageNumber)}
        onClick={() => handleBoundingBoxClick(box)}
        className="hover:bg-blue-200 hover:bg-opacity-30 group"
        title={`Chess diagram ${index + 1} (confidence: ${box.confidence?.toFixed(2) || 'N/A'})`}
      >
        {processingBox === box && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-100 bg-opacity-50 rounded">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
          </div>
        )}
        
        {selectedBox === box && (
          <div className="absolute -top-8 left-0 bg-green-600 text-white px-2 py-1 text-xs rounded shadow-lg">
            ✓ Selected
          </div>
        )}
        
        {/* Confidence indicator */}
        {box.confidence && (
          <div className="absolute -top-6 right-0 bg-blue-600 text-white px-1 py-0.5 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {Math.round(box.confidence * 100)}%
          </div>
        )}
        
        {/* Corner indicator for better visibility */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-current rounded-full opacity-60"></div>
        
        {/* Chess piece icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity">
          <span className="text-4xl">♛</span>
        </div>
      </div>
    ));
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No PDF URL provided</p>
      </div>
    );
  }

  return (
    <div className={`pdf-chess-viewer h-full flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              ‹
            </button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              ›
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              -
            </button>
            <span className="text-sm min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Chess Detection Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => detectChessOnPage(currentPage)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Detect Chess
          </button>
          <button
            onClick={() => setBoundingBoxes([])}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Clear Boxes
          </button>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showBoundingBoxes}
              readOnly
              className="rounded"
            />
            <span>Show Boxes</span>
          </label>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100" ref={containerRef}>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading PDF...</span>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg m-4">
            <p className="text-red-600 mb-4">{error}</p>
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
        )}

        {!loading && !error && (
          <div className="flex justify-center p-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <div className="relative">
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  onRenderSuccess={() => onPageRenderSuccess(currentPage)}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  }
                  onLoadSuccess={() => {
                    const pageElement = document.querySelector(`[data-page-number="${currentPage}"]`) as HTMLDivElement;
                    if (pageElement) {
                      pageRefs.current.set(currentPage, pageElement);
                    }
                  }}
                />
                
                {/* Render bounding boxes for current page */}
                {showBoundingBoxes && renderBoundingBoxes(currentPage)}
              </div>
            </Document>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {boundingBoxes.filter(box => box.page === currentPage).length} chess diagrams detected on this page
          </span>
          {selectedBox && (
            <span className="text-green-600">
              Selected: Page {selectedBox.page}, Position ({selectedBox.x}, {selectedBox.y})
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

PDFChessViewer.displayName = 'PDFChessViewer';

export default PDFChessViewer;
export type { PDFChessViewerRef, ChessBoundingBox };
