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
  const [loading, setLoading] = useState(!bookFromState);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [hasPDF, setHasPDF] = useState(false);
  
  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    file: null as File | null
  });

  // Load book content
  useEffect(() => {
    const loadBookContent = async () => {
      if (!bookId) {
        setShowUpload(true);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Load book info if not passed via state
        if (!book) {
          const bookData = await booksApiService.getBook(bookId);
          setBook(bookData);
        }
        
        // Check if PDF is available
        const pdfAvailable = await booksApiService.hasPDFFile(bookId);
        setHasPDF(pdfAvailable);
        
        if (pdfAvailable) {
          const pdfFileUrl = await booksApiService.getPDFUrl(bookId);
          setPdfUrl(pdfFileUrl);
          
          // Also try to get the PDF file for chess detection
          try {
            const pdfFile = await booksApiService.getPDFFile(bookId);
            setPdfFile(pdfFile);
          } catch (pdfFileError) {
            console.log('Could not load PDF file for chess detection:', pdfFileError);
            // PDF URL is still available for viewing
          }
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

  // Handle PDF upload
  const handleUploadPDF = async () => {
    if (!uploadForm.file || !uploadForm.title.trim() || !uploadForm.author.trim()) {
      setError('Please fill in all fields and select a PDF file');
      return;
    }
    
    // Check file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (uploadForm.file.size > maxSize) {
      setError('File is too large. Please choose a PDF file smaller than 50MB.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const uploadedBook = await booksApiService.uploadBook(
        uploadForm.file, 
        uploadForm.title, 
        uploadForm.author
      );
      
      // Navigate to the newly uploaded book
      navigate(`/library/book/${uploadedBook.id}`, { 
        state: { book: uploadedBook },
        replace: true 
      });
      
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleChessBoardClick = (fen: string, boundingBox: ChessBoundingBox) => {
    console.log('Chess board clicked:', { fen, boundingBox });
    // You can add logic here to handle the chess board click
    // For example, display the FEN in a modal or analyze the position
  };

  // Show upload form if no book ID or if upload requested
  if (!bookId || showUpload) {
    return (
      <div className="min-h-screen bg-[#121621] text-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1a1f2e] rounded-lg p-8 border border-[#374162]">
              <h1 className="text-2xl font-bold text-white mb-6 text-center">Upload PDF Book</h1>
              
              {error && (
                <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Form Fields */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Book Title</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#272e45] border border-[#374162] rounded-lg text-white focus:outline-none focus:border-blue-800"
                    placeholder="Enter book title"
                    disabled={uploading}
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={uploadForm.author}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#272e45] border border-[#374162] rounded-lg text-white focus:outline-none focus:border-blue-800"
                    placeholder="Enter author name"
                    disabled={uploading}
                  />
                </div>
                
                {/* File Upload */}
                <div className="border-2 border-dashed border-[#374162] rounded-lg p-8 text-center hover:border-blue-800/50 transition-colors">
                  <svg className="w-12 h-12 text-[#97a1c4] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  
                  {uploadForm.file ? (
                    <div>
                      <p className="text-white font-medium mb-2">Selected: {uploadForm.file.name}</p>
                      <p className="text-[#97a1c4] text-sm mb-4">
                        Size: {(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <button
                        onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                        className="text-[#97a1c4] hover:text-white text-sm"
                        disabled={uploading}
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-medium mb-2 text-base">
                        {uploading ? 'Uploading and processing...' : 'Select your PDF file'}
                      </p>
                      <p className="text-[#97a1c4] text-sm mb-4">
                        PDF format only • Max 50MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setError(null);
                            setUploadForm(prev => ({ ...prev, file }));
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center px-6 py-3 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-all duration-300 cursor-pointer font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Choose PDF File
                      </label>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="mt-4">
                      <div className="bg-[#374162] rounded-full h-2">
                        <div className="bg-blue-800 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-[#97a1c4] text-sm mt-2">
                        Processing may take up to 2 minutes for large files...
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/library')}
                    disabled={uploading}
                    className="flex-1 px-6 py-3 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50"
                  >
                    Back to Library
                  </button>
                  <button
                    onClick={handleUploadPDF}
                    disabled={uploading || !uploadForm.file || !uploadForm.title.trim() || !uploadForm.author.trim()}
                    className="flex-1 px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {uploading ? 'Processing...' : 'Upload & View PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/library')}
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Library
            </button>
            <button 
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload New PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Book not found</h2>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/library')}
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Library
            </button>
            <button 
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload New PDF
            </button>
          </div>
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
          
          <div className="text-xs text-[#97a1c4] space-y-1 mb-6">
            <div><span className="font-medium">Status:</span> {hasPDF ? 'PDF Available' : 'No PDF'}</div>
            <div><span className="font-medium">Total Pages:</span> {book?.totalPages || 'Unknown'}</div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/library')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              ← Back to Library
            </button>
            
            <button 
              onClick={() => setShowUpload(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              + Upload New PDF
            </button>
          </div>
        </div>
        
        {/* Main Content Area - PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {hasPDF && pdfUrl ? (
            <ChessPDFViewer
              pdfUrl={pdfUrl} 
              {...(pdfFile && { pdfFile })}
              onChessBoardClick={handleChessBoardClick}
              className="h-full w-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No PDF Available</h3>
                <p className="text-gray-400 mb-4">Upload a PDF file to get started.</p>
                <button 
                  onClick={() => setShowUpload(true)}
                  className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookReader;
