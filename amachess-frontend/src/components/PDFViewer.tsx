import React, { useState, useEffect } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Debug PDF URL
  useEffect(() => {
    console.log('PDFViewer received URL:', pdfUrl);
    console.log('PDF URL type:', typeof pdfUrl);
    console.log('PDF URL length:', pdfUrl?.length);
  }, [pdfUrl]);

  // Handle iframe load
  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF. Please try again.');
  };

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No PDF URL provided</p>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container h-full ${className}`}>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading PDF...</span>
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
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

      {!error && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          className="border-0 min-h-[600px] w-full"
          onLoad={handleLoad}
          onError={handleError}
          title="PDF Viewer"
          style={{ 
            display: loading ? 'none' : 'block',
            minHeight: '600px',
            border: 'none'
          }}
        />
      )}
    </div>
  );
};

export default PDFViewer;
