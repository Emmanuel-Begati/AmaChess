import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ChessPDFViewer from '../components/ChessPDFViewer';
import { booksApiService } from '../services/booksApi';
import type { ChessBoundingBox } from '../services/chessVisionService';

const BookReader = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookFromState = location.state?.book;
  
  const [book, setBook] = useState(bookFromState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hasPDF, setHasPDF] = useState(false);

  // Load book content from backend
  useEffect(() => {
    const loadBookContent = async () => {
      if (!bookId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load book info if not passed via state
        if (!book) {
          console.log('Loading book data for ID:', bookId);
          const bookData = await booksApiService.getBook(bookId);
          setBook(bookData);
          console.log('Book data loaded:', bookData);
        }
        
        // Check if PDF is available first
        console.log('Checking PDF availability for book:', bookId);
        const pdfAvailable = await booksApiService.hasPDFFile(bookId);
        console.log('PDF available:', pdfAvailable);
        setHasPDF(pdfAvailable);
        
        if (pdfAvailable) {
          console.log('Getting PDF URL...');
          const pdfFileUrl = await booksApiService.getPDFUrl(bookId);
          console.log('PDF URL received:', pdfFileUrl);
          setPdfUrl(pdfFileUrl);
        }
        
      } catch (err) {
        console.error('Failed to load book content:', err);
        setError('Failed to load book content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBookContent();
  }, [bookId, book]);

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true' ||
                            document.referrer.includes('/dashboard') ||
                           document.referrer.includes('/library');
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [navigate]);

  if (!book && !loading) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Book not found</h2>
          <button 
            onClick={() => navigate('/library')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Loading book content...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">{error}</h2>
          <button 
            onClick={() => navigate('/library')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121621] text-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <Header />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Book Info */}
        <div className="w-80 bg-[#1a1f2e] border-r border-[#374162] flex flex-col p-6">
          <h1 className="text-xl font-bold text-white mb-2">{book?.title || 'Unknown Book'}</h1>
          <p className="text-[#97a1c4] text-sm mb-4">by {book?.author || 'Unknown Author'}</p>
          
          {book?.originalFileName && (
            <div className="text-xs text-[#97a1c4] mb-4">
              <span className="font-medium">File:</span> {book.originalFileName}
            </div>
          )}
          
          <div className="text-xs text-[#97a1c4] space-y-1">
            <div><span className="font-medium">Status:</span> {hasPDF ? 'PDF Available' : 'No PDF'}</div>
            <div><span className="font-medium">Total Pages:</span> {book?.totalPages || 'Unknown'}</div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => navigate('/library')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              ← Back to Library
            </button>
          </div>
        </div>
        
        {/* Main Content Area - PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {hasPDF && pdfUrl ? (
            <SimplePDFViewer 
              pdfUrl={pdfUrl} 
              className="h-full w-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">PDF Not Available</h3>
                <p className="text-gray-400 mb-4">This book's PDF file could not be loaded.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Has PDF: {hasPDF ? 'Yes' : 'No'}</p>
                  <p>PDF URL: {pdfUrl ? 'Available' : 'Not available'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookReader;
