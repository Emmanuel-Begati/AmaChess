import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFViewerService, PDFViewerConfig } from '../services/pdfViewer';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  onPageChange?: (page: number) => void;
  className?: string;
  initialPage?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  onPageChange, 
  className = '',
  initialPage = 1 
}) => {
  const [config, setConfig] = useState<PDFViewerConfig>(() => ({
    ...PDFViewerService.getInitialConfig(),
    page: initialPage
  }));
  const [pageWidth, setPageWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle document load
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setConfig(prev => ({
      ...prev,
      totalPages: numPages,
      isLoading: false,
      error: null
    }));
  }, []);

  // Handle document load error
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setConfig(prev => ({
      ...prev,
      isLoading: false,
      error: 'Failed to load PDF. Please try again.'
    }));
  }, []);

  // Handle page load success
  const onPageLoadSuccess = useCallback((page: any) => {
    if (pageWidth === 0) {
      setPageWidth(page.width);
      // Auto-scale to fit container
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const optimalScale = PDFViewerService.calculateOptimalScale(containerWidth, page.width);
        setConfig(prev => ({ ...prev, scale: optimalScale }));
      }
    }
  }, [pageWidth]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= config.totalPages) {
      setConfig(prev => ({ ...prev, page: newPage }));
      onPageChange?.(newPage);
    }
  }, [config.totalPages, onPageChange]);

  // Handle scale change
  const handleScaleChange = useCallback((newScale: number) => {
    setConfig(prev => ({ ...prev, scale: newScale }));
  }, []);

  // Navigation functions
  const goToPrevPage = () => handlePageChange(config.page - 1);
  const goToNextPage = () => handlePageChange(config.page + 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          goToNextPage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [config.page, config.totalPages]);

  if (config.error) {
    return (
      <div className={`bg-red-900/20 border border-red-600 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-400 mb-2">PDF Loading Error</h3>
          <p className="text-red-300 text-sm">{config.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      {/* PDF Controls */}
      <div className="bg-[#1a1f2e] border-b border-[#374162] p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={config.page <= 1}
              className="p-2 bg-[#374162] text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page (Arrow Left)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <input
                type="number"
                min="1"
                max={config.totalPages}
                value={config.page}
                onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 bg-[#374162] text-white rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[#97a1c4]">of {config.totalPages}</span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={config.page >= config.totalPages}
              className="p-2 bg-[#374162] text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page (Arrow Right)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scale Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScaleChange(Math.max(0.5, config.scale - 0.25))}
              disabled={config.scale <= 0.5}
              className="p-2 bg-[#374162] text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <select
              value={config.scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="bg-[#374162] text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PDFViewerService.getScaleOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => handleScaleChange(Math.min(2.0, config.scale + 0.25))}
              disabled={config.scale >= 2.0}
              className="p-2 bg-[#374162] text-white rounded hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Document */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-[#0f1419] p-4">
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-[#97a1c4]">Loading PDF...</span>
              </div>
            }
            className="shadow-lg"
          >
            <Page
              pageNumber={config.page}
              scale={config.scale}
              onLoadSuccess={onPageLoadSuccess}
              loading={
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              }
              className="border border-[#374162] bg-white"
            />
          </Document>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#1a1f2e] border-t border-[#374162] px-4 py-2 text-xs text-[#97a1c4]">
        <div className="flex items-center justify-between">
          <span>Page {config.page} of {config.totalPages}</span>
          <span>Scale: {Math.round(config.scale * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
