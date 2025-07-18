import React, { useState, useRef } from 'react';

interface SimplePDFViewerProps {
  pdfUrl: string;
  className?: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
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
            className="h-full w-full flex justify-center"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFViewer;
