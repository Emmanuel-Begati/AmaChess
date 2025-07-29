import React, { useState, useRef, useEffect } from 'react';
import { chessVisionService } from '../../services/chessVisionService';
import type { ChessBoundingBox } from '../../services/chessVisionService';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageBoards, setCurrentPageBoards] = useState<ChessBoundingBox[]>([]);
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [loadingFen, setLoadingFen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Define navigation functions first
  const goToNextPage = async () => {
    const nextPage = currentPage + 1;
    
    console.log('goToNextPage called, current page:', currentPage, 'next page:', nextPage);
    
    if (chessBoards.length > 0) {
      // Find the highest page number with boards to determine max page
      const maxPageWithBoards = Math.max(...chessBoards.map(board => board.page));
      
      if (nextPage <= maxPageWithBoards) {
        await updateCurrentPageBoards(nextPage);
      }
    } else {
      // If no boards detected, allow navigation up to a reasonable limit
      if (nextPage <= 1000) { // Reasonable upper limit
        setCurrentPage(nextPage);
        console.log('Set current page to:', nextPage);
      }
    }
  };

  const goToPrevPage = async () => {
    const prevPage = currentPage - 1;
    
    console.log('goToPrevPage called, current page:', currentPage, 'prev page:', prevPage);
    
    if (prevPage >= 1) {
      if (chessBoards.length > 0) {
        await updateCurrentPageBoards(prevPage);
      } else {
        setCurrentPage(prevPage);
        console.log('Set current page to:', prevPage);
      }
    }
  };

  const navigateToBoard = async (direction: 'prev' | 'next') => {
    if (currentPageBoards.length === 0) return;
    
    let newIndex = currentBoardIndex;
    if (direction === 'prev') {
      newIndex = currentBoardIndex > 0 ? currentBoardIndex - 1 : currentPageBoards.length - 1;
    } else {
      newIndex = currentBoardIndex < currentPageBoards.length - 1 ? currentBoardIndex + 1 : 0;
    }
    
    setCurrentBoardIndex(newIndex);
    const selectedBoard = currentPageBoards[newIndex];
    if (selectedBoard) {
      await loadFenForBoard(selectedBoard);
    }
  };

  // Add keyboard shortcuts for board navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!loadingFen) {
        if (event.key === 'ArrowLeft' && event.ctrlKey) {
          event.preventDefault();
          if (currentPageBoards.length > 1) {
            navigateToBoard('prev');
          } else {
            goToPrevPage();
          }
        } else if (event.key === 'ArrowRight' && event.ctrlKey) {
          event.preventDefault();
          if (currentPageBoards.length > 1) {
            navigateToBoard('next');
          } else {
            goToNextPage();
          }
        } else if (event.key === 'ArrowLeft' && !event.ctrlKey) {
          event.preventDefault();
          goToPrevPage();
        } else if (event.key === 'ArrowRight' && !event.ctrlKey) {
          event.preventDefault();
          goToNextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageBoards, loadingFen, currentPage, chessBoards]);

  // Update iframe when current page changes
  useEffect(() => {
    if (iframeRef.current) {
      const newUrl = `${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitV`;
      console.log('Updating iframe URL to:', newUrl);
      
      // Force reload the iframe by setting src to empty first, then to the new URL
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = newUrl;
        }
      }, 10);
    }
  }, [currentPage, pdfUrl]);

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
      
      // Automatically show boards for the current page
      updateCurrentPageBoards(1, boundingBoxes);
      
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

  const updateCurrentPageBoards = async (pageNumber: number, allBoards: ChessBoundingBox[] = chessBoards) => {
    const pageBoards = allBoards.filter(board => board.page === pageNumber);
    setCurrentPageBoards(pageBoards);
    setCurrentBoardIndex(0);
    setCurrentPage(pageNumber);
    
    // Automatically load FEN for the first board on this page
    if (pageBoards.length > 0 && pageBoards[0]) {
      await loadFenForBoard(pageBoards[0]);
    } else {
      // Clear the board if no boards on this page
      console.log(`No chess boards found on page ${pageNumber}`);
      // You might want to call a callback to clear the chess board display
      if (onChessBoardClick) {
        // Pass a starting position or empty board
        onChessBoardClick('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
          page: pageNumber,
          x: 0,
          y: 0,
          width: 0,
          height: 0
        });
      }
    }
  };

  const loadFenForBoard = async (boundingBox: ChessBoundingBox) => {
    if (!onChessBoardClick) return;

    try {
      setLoadingFen(true);
      console.log('Loading FEN for board:', boundingBox);
      
      const fen = await chessVisionService.extractFenFromCoordinates(
        boundingBox.page,
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );
      
      console.log('FEN loaded:', fen);
      onChessBoardClick(fen, boundingBox);
    } catch (err) {
      console.error('Error loading FEN:', err);
      setError('Failed to load chess position. Please try again.');
    } finally {
      setLoadingFen(false);
    }
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
      {/* Keyboard shortcuts help */}
      <div className="text-center py-1 bg-[#0f1419] text-xs text-gray-400 border-b border-[#374162]">
        <span className="mr-4">← → Navigate pages</span>
        {currentPageBoards.length > 1 && (
          <span>• Ctrl+← Ctrl+→ Navigate boards on current page</span>
        )}
        {chessBoards.length > 0 && (
          <span className="ml-4">• Total: {chessBoards.length} boards detected</span>
        )}
      </div>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-[#1a1f2e] border-b border-[#374162] shadow-lg">
        {/* Left side - Zoom controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#374162] rounded-lg p-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-1 text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-white text-sm font-medium min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-1 text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium transition-colors"
              title="Reset zoom to 100%"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Right side - Navigation and controls */}
        <div className="flex items-center space-x-3">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2 bg-[#374162] rounded-lg p-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="flex items-center space-x-1 px-2 py-1 text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              title="Previous page (←)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center px-2">
              <span className="text-white text-sm font-medium">
                Page {currentPage}
              </span>
              {chessBoards.length > 0 && (
                <span className="text-xs text-gray-300">
                  {currentPageBoards.length} board{currentPageBoards.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={goToNextPage}
              disabled={chessBoards.length > 0 && currentPage >= Math.max(...chessBoards.map(board => board.page))}
              className="flex items-center space-x-1 px-2 py-1 text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              title="Next page (→)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Board Navigation for current page */}
          {currentPageBoards.length > 1 && (
            <div className="flex items-center space-x-2 bg-purple-600/20 rounded-lg p-2">
              <button
                onClick={() => navigateToBoard('prev')}
                disabled={loadingFen}
                className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                title="Previous board on this page (Ctrl+←)"
              >
                ← Prev Board
              </button>
              <div className="flex flex-col items-center px-2">
                {loadingFen ? (
                  <span className="flex items-center text-white text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  <>
                    <span className="text-white text-sm font-medium">
                      Board {currentBoardIndex + 1}
                    </span>
                    <span className="text-xs text-gray-300">
                      of {currentPageBoards.length}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => navigateToBoard('next')}
                disabled={loadingFen}
                className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                title="Next board on this page (Ctrl+→)"
              >
                Next Board →
              </button>
            </div>
          )}

          {/* Status indicators */}
          {currentPageBoards.length === 1 && (
            <div className="flex items-center space-x-2 bg-green-600/20 rounded-lg p-2">
              <span className="text-green-400 text-sm">
                {loadingFen ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400 mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    1 board found
                  </span>
                )}
              </span>
            </div>
          )}

          {chessBoards.length > 0 && currentPageBoards.length === 0 && (
            <div className="flex items-center space-x-2 bg-orange-600/20 rounded-lg p-2">
              <span className="text-orange-400 text-sm">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  No boards on this page
                </span>
              </span>
            </div>
          )}
          
          {/* Chess Detection Controls - Only show if no boards detected */}
          {chessBoards.length === 0 && (
            <div className="flex items-center space-x-2 bg-green-600/20 rounded-lg p-2">
              <button
                onClick={() => detectChessBoards(10, 1)}
                disabled={detectingChess || !pdfFile}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {detectingChess ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Detecting...
                  </span>
                ) : (
                  'Detect Chess Boards'
                )}
              </button>
              <button
                onClick={() => detectChessBoards()}
                disabled={detectingChess || !pdfFile}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                title="Process all pages"
              >
                {detectingChess ? 'Processing...' : 'All Pages'}
              </button>
            </div>
          )}
          
          {/* Summary and Clear - Show after detection */}
          {chessBoards.length > 0 && (
            <div className="flex items-center space-x-2 bg-blue-600/20 rounded-lg p-2">
              <span className="text-blue-400 text-sm font-medium">
                {chessBoards.length} boards found
              </span>
              <button
                onClick={() => {
                  setChessBoards([]);
                  setCurrentPageBoards([]);
                  setCurrentBoardIndex(0);
                }}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                title="Clear all detected boards"
              >
                Clear
              </button>
            </div>
          )}
          
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121621] z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <span className="text-white text-lg">Loading PDF...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121621] z-20">
            <div className="text-center bg-[#1a1f2e] p-8 rounded-lg border border-red-400/50">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-400 mb-6 text-lg">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {detectingChess && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121621]/80 z-10">
            <div className="text-center bg-[#1a1f2e] p-8 rounded-lg border border-green-400/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <span className="text-white text-lg">Detecting chess boards...</span>
              <p className="text-gray-400 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        <div className="h-full w-full relative">
          <div 
            className="h-full w-full flex justify-center items-center transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitV`}
              width="100%"
              height="100%"
              className="border-0 shadow-lg"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Viewer"
              style={{ 
                display: loading ? 'none' : 'block',
                minHeight: '100%',
                minWidth: '100%',
                border: 'none',
                backgroundColor: '#fff',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessPDFViewer;
