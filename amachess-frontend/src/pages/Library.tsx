import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { booksApiService, Book } from '../services/booksApi';
import { useAuth } from '../contexts/AuthContext';

const Library = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedBooks, setUploadedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    file: null as File | null
  });
  const [deleteModal, setDeleteModal] = useState<{show: boolean, book: Book | null}>({
    show: false,
    book: null
  });
  const [deleting, setDeleting] = useState(false);
  const [selectedBookForAnalysis, setSelectedBookForAnalysis] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  const featuredBooks = [
    {
      id: 2,
      title: "The Queen's Gambit",
      author: "Walter Tevis",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1RzJAfWgZHWOHC7l6YWHNN_nEXxiGj89CAQCeG5g7SdggiMMCRk_tL3hcbyK8mtX4BPNeK0klrdaCL_x4G8v29eS35n3SiPPkV54QytxfGPyfEn4irwVehXvpQc-Sfp1Zf_456p4F2pW2uh07M7S_GxWAZ9CBAO9DGBAlocy985jOb85_o_kZ4Otql3e8TjCGanvWyj8MvpQq0bdyjLgeAz0Os-jSdTgbggu0nw6PQDPvVOrRDgomhlL4BvpH-nlSLdYAMSFyIWY",
      positions: 0
    },
    {
      id: 3,
      title: "Chess Fundamentals",
      author: "Jose Capablanca",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhNa659kTSWrdMrx4Cg3AFY4fVwpPmxArYR8jgncLncxzQPnOto3sNwmNgYFl78be-zxwGZHYrnN73JVMxa3WHoXm3DO2z1WoY42sYwyp8a5iaEjVEZoUYYdrYuEl6kRmsulFWnVuDhlKn6iXYdn0aJSiFqqnIrpRilLuDM5ErDegu3weF7fbs-xFSHGS7eV5TO1jXJO6MuLY1Thwzz1PnHCNqgOx3WoDBva6Mww16cGgFBnZgtaxsyTELhhbBCp4Shl0xEpHc5Rs",
      positions: 127
    },
    {
      id: 4,
      title: "Modern Chess Strategy",
      author: "Ludek Pachman",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAza8Nu3XQ567fnpmQAia42W2q23GPfI50iYUPcTfJf7dNub7q65RyiweFUcw1FvuR9jyVbxEy3dVrclTADjuIHLS-_1kWUweHVSssHM-D2iFAp4DBzjfsZJaW2y56ugPN7QdloReWja5W8K_VYYlxmKlN7DbbflYMxO1ckOvR4iQ_DHy4UQVTRolJ5m7FHqo_H1KBFhL7MpKiVy7Jt9tePULe5EoEuwK9mEFkWIockuHuudelyl3qztovf3kwaZMFybqFqMpN8-U8",
      positions: 89
    }
  ];

  const communityFavorites = [
    {
      id: 5,
      title: "Chess Structures",
      author: "Mauricio Flores Rios",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuDznMO88L_35-Oq-3UzaqRxtjeYajARkNpPVi3OY20RY4l3gn8lxhZXDGilB3qB3CSbzbLelaAQEsIQrywkMj8gebtg2hDXPIs3Ra43_XOR3cg_ORIjpY-kkpzvtzQdL_oCnOY9hcPVIIj9MruAFFH_zuW7yijkfqaobReugfNWz-J_r4p5Cy5EeR0DRFoRHAe61u5fH_AcN0TzcgwmWY5kc0lRkYqigZhKnNzKor8MIdFL-cAZuro8nYZNqAulYZPse51B1-vFKQ4",
      rating: 4.8,
      positions: 156
    },
    {
      id: 6,
      title: "The Art of Attack",
      author: "Vladimir Vuković",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_9VIZhGSlkPhBIxzyqrGxjHDDvuWuLp4zQmPtXRpIwsUGlX5lXN7BZg3sCGAbQJPzZ4NrL5KpK6pxrAAm8DhSCYZn8X7DpvjxmnwBiP6Ka4xyBRMUsqOHPOn4n6XjM_CzxEiniFWmF1EJBhVcBFiem2FaStz3hCDP7YklNe-Freter7LcF99SrFimu137C6JF8BbxhvaUJhAtHSmsmtq7r8uYzAnR0I4ndZHVQhUO5zPLDD5mPTn1QhwxGXcmsK3_3eSj3O3lifI",
      rating: 4.9,
      positions: 203
    }
  ];

  // Load books from backend
  useEffect(() => {
    const loadBooks = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        const books = await booksApiService.getBooks();
        setUploadedBooks(books);
      } catch (err) {
        console.error('Failed to load books:', err);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [isAuthenticated]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      const isAuth = localStorage.getItem('userAuthenticated') === 'true' || 
                     document.referrer.includes('/dashboard');
      
      if (!isAuth) {
        localStorage.setItem('userAuthenticated', 'true');
      }
    }
  }, [isAuthenticated]);

  const handleBookClick = (book: Book | any) => {
    localStorage.setItem('userAuthenticated', 'true');
    navigate(`/library/book/${book.id}`, { state: { book } });
  };

  const handleUploadBook = async () => {
    if (!uploadForm.file || !uploadForm.title.trim() || !uploadForm.author.trim()) {
      setError('Please fill in all fields and select a file');
      return;
    }
    
    // Check file size before uploading
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (uploadForm.file.size > maxSize) {
      setError('File is too large. Please choose a PDF file smaller than 50MB.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      console.log(`Uploading PDF file: ${uploadForm.file.name}, Size: ${uploadForm.file.size} bytes`);
      
      const uploadedBook = await booksApiService.uploadBook(uploadForm.file, uploadForm.title, uploadForm.author);
      
      console.log('PDF upload successful:', uploadedBook);
      
      setUploadedBooks(prev => [...prev, uploadedBook]);
      setShowUploadModal(false);
      setUploadForm({ title: '', author: '', file: null });
      
      // Show success message briefly
      setError(null);
      
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!book.id) {
      setError('Cannot delete book: Invalid book ID');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      console.log(`Deleting book: ${book.title} (ID: ${book.id})`);
      
      await booksApiService.deleteBook(book.id);
      
      // Remove book from state
      setUploadedBooks(prev => prev.filter(b => b.id !== book.id));
      
      // Close modal
      setDeleteModal({ show: false, book: null });
      
      console.log('Book deleted successfully');
      
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete book. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (book: Book) => {
    setDeleteModal({ show: true, book });
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setDeleteModal({ show: false, book: null });
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Reload all books if search is cleared
      try {
        const books = await booksApiService.getBooks();
        setUploadedBooks(books);
      } catch (err) {
        console.error('Failed to reload books:', err);
      }
      return;
    }

    try {
      const searchResults = await booksApiService.searchBooks(query);
      setUploadedBooks(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    }
  };

  const getFilteredBooks = () => {
    switch (activeTab) {
      case 'My Library':
        return uploadedBooks;
      case 'Featured':
        return featuredBooks;
      case 'Popular':
        return communityFavorites;
      default:
        return [...uploadedBooks, ...featuredBooks, ...communityFavorites];
    }
  };

  return (
    <div className="min-h-screen bg-[#121621] dark group/design-root flex flex-col" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <Header />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-600 text-white p-4 text-center">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main Content Container - Two Column Layout */}
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8">
          <div className="max-w-[1600px] mx-auto">
            
            {/* Header Section - Fluid Layout */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8 mb-6 lg:mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-3 lg:mb-4">
                  Library
                </h1>
                <p className="text-[#97a1c4] text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                  Explore a vast collection of chess literature, from classic treatises to modern analyses, enriched with interactive features and community insights.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload Book
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Two Column Layout: Books on Left, Analysis Board on Right */}
            <div className="space-y-6 lg:space-y-8">
              
              {/* Left Column - Books Section */}
              <div className="xl:col-span-2">
                
                {/* Search Bar - Full Width Responsive */}
                <div className="mb-6 lg:mb-8">
                  <div className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-[#97a1c4]" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search for books, authors, or topics"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full h-12 sm:h-14 lg:h-16 pl-10 sm:pl-12 pr-4 sm:pr-6 bg-[#272e45] border-0 rounded-lg text-white placeholder:text-[#97a1c4] focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm sm:text-base lg:text-lg"
                    />
                  </div>
                </div>
            
            {/* Tab Navigation - Responsive with Scroll */}
            <div className="mb-6 lg:mb-8">
              <div className="border-b border-[#374162]">
                <div className="flex gap-4 sm:gap-6 lg:gap-8 xl:gap-12 overflow-x-auto scrollbar-hide pb-4">
                  {['All', 'My Library', 'Featured', 'Popular'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-shrink-0 pb-4 border-b-2 transition-all duration-300 ${
                        activeTab === tab
                          ? 'border-blue-800 text-white'
                          : 'border-transparent text-[#97a1c4] hover:text-white hover:border-[#97a1c4]'
                      }`}
                    >
                      <span className="text-sm sm:text-base lg:text-lg font-semibold tracking-wide">
                        {tab}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
                <span className="ml-4 text-[#97a1c4]">Loading books...</span>
              </div>
            )}
            
            {/* My Library Section - Responsive Grid */}
            {!loading && (activeTab === 'My Library' || activeTab === 'All') && uploadedBooks.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 lg:mb-6">
                  My Uploaded Books
                </h2>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-10 gap-3 sm:gap-4 lg:gap-6">
                  {uploadedBooks.map((book) => (
                    <div 
                      key={book.id} 
                      className="group transition-all duration-300 hover:scale-105" 
                    >
                      <div className="bg-[#1a1f2e] rounded-lg p-2 sm:p-3 lg:p-4 border border-[#374162] hover:border-blue-800/50 transition-all duration-300 relative">
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(book);
                          }}
                          className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 sm:p-1.5 z-10"
                          title="Delete book"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Book Content - clickable */}
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleBookClick(book)}
                        >
                          <div
                            className="w-full aspect-[3/4] bg-cover bg-center bg-no-repeat rounded-md mb-2 sm:mb-3 group-hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center"
                          >
                            <svg className="w-8 h-8 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-white text-xs sm:text-sm lg:text-base font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-[#97a1c4] text-xs lg:text-sm truncate">
                              {book.author || 'Unknown Author'}
                            </p>
                            <p className="text-[#97a1c4] text-xs">
                              {book.totalPositions || 0} positions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State for My Library */}
            {!loading && (activeTab === 'My Library') && uploadedBooks.length === 0 && (
              <section className="mb-8 lg:mb-12">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-[#97a1c4] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">No books uploaded yet</h3>
                  <p className="text-[#97a1c4] mb-4">Upload your first chess book to get started</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Book
                  </button>
                </div>
              </section>
            )}

            {/* Featured Books - Horizontal Scroll */}
            {!loading && (activeTab === 'All' || activeTab === 'Featured') && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 lg:mb-6">
                  Featured Books
                </h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 sm:gap-4 lg:gap-6 pb-4 min-w-max">
                    {featuredBooks.map((book) => (
                      <div 
                        key={book.id} 
                        className="group flex-shrink-0 w-32 sm:w-40 lg:w-48 xl:w-56 cursor-pointer transition-all duration-300 hover:scale-105" 
                        onClick={() => handleBookClick(book)}
                      >
                        <div className="bg-[#1a1f2e] rounded-lg p-3 sm:p-4 lg:p-5 border border-[#374162] hover:border-blue-800/50 transition-all duration-300 h-full">
                          <div
                            className="w-full aspect-[3/4] bg-cover bg-center bg-no-repeat rounded-md mb-3 group-hover:shadow-lg transition-shadow duration-300"
                            style={{backgroundImage: `url("${book.cover}")`}}
                          />
                          <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-white text-xs sm:text-sm lg:text-base font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-[#97a1c4] text-xs lg:text-sm truncate">
                              {book.author}
                            </p>
                            {book.positions > 0 && (
                              <p className="text-[#97a1c4] text-xs">
                                {book.positions} positions
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Community Favorites - Responsive Grid */}
            {!loading && (activeTab === 'All' || activeTab === 'Popular') && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 lg:mb-6">
                  Community Favorites
                </h2>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-10 gap-3 sm:gap-4 lg:gap-6">
                  {communityFavorites.map((book) => (
                    <div 
                      key={book.id} 
                      className="group cursor-pointer transition-all duration-300 hover:scale-105" 
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="bg-[#1a1f2e] rounded-lg p-2 sm:p-3 lg:p-4 border border-[#374162] hover:border-blue-800/50 transition-all duration-300">
                        <div
                          className="w-full aspect-[3/4] bg-cover bg-center bg-no-repeat rounded-md mb-2 sm:mb-3 group-hover:shadow-lg transition-shadow duration-300"
                          style={{backgroundImage: `url("${book.cover}")`}}
                        />
                        <div className="space-y-1">
                          <h3 className="text-white text-xs sm:text-sm lg:text-base font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-[#97a1c4] text-xs lg:text-sm truncate">
                            {book.author}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-[#97a1c4] text-xs ml-1">{book.rating}</span>
                            </div>
                            <span className="text-[#97a1c4] text-xs">• {book.positions} positions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            </div> {/* End space-y container */}
            </div> {/* End header section */}
          </div> {/* End max-w container */}
        </div> {/* End container */}

        {/* Upload Modal - Responsive */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121621] rounded-xl w-full max-w-lg mx-4 p-4 sm:p-6 lg:p-8 border border-[#374162]">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Upload Chess Book</h3>
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadForm({ title: '', author: '', file: null });
                        setError(null); // Clear error when closing
                      }}
                      disabled={uploading}
                      className="text-[#97a1c4] hover:text-white transition-colors p-1 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Form Fields */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Book Title</label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#272e45] border border-[#374162] rounded-lg text-white focus:outline-none focus:border-blue-800"
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
                        className="w-full px-3 py-2 bg-[#272e45] border border-[#374162] rounded-lg text-white focus:outline-none focus:border-blue-800"
                        placeholder="Enter author name"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-[#374162] rounded-lg p-6 sm:p-8 text-center hover:border-blue-800/50 transition-colors">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#97a1c4] mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {uploadForm.file ? (
                      <div>
                        <p className="text-white font-medium mb-2">Selected: {uploadForm.file.name}</p>
                        <p className="text-[#97a1c4] text-sm mb-2">
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
                        <p className="text-white font-medium mb-2 text-sm sm:text-base">
                          {uploading ? 'Uploading and processing...' : 'Select your chess book PDF'}
                        </p>
                        <p className="text-[#97a1c4] text-xs sm:text-sm mb-4">
                          PDF format only • Max 50MB
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setError(null); // Clear any previous errors
                              setUploadForm(prev => ({ ...prev, file }));
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-all duration-300 cursor-pointer text-sm sm:text-base font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  
                  {/* Upload Button */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadForm({ title: '', author: '', file: null });
                        setError(null);
                      }}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadBook}
                      disabled={uploading || !uploadForm.file || !uploadForm.title.trim() || !uploadForm.author.trim()}
                      className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Processing...' : 'Upload Book'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && deleteModal.book && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121621] rounded-xl w-full max-w-md mx-4 p-4 sm:p-6 border border-[#374162]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Delete Book</h3>
                    <button
                      onClick={closeDeleteModal}
                      disabled={deleting}
                      className="text-[#97a1c4] hover:text-white transition-colors p-1 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-white mb-2">
                      Are you sure you want to delete this book?
                    </p>
                    <div className="bg-[#272e45] rounded-lg p-3 mb-4">
                      <h4 className="text-white font-medium">{deleteModal.book.title}</h4>
                      <p className="text-[#97a1c4] text-sm">by {deleteModal.book.author}</p>
                    </div>
                    <p className="text-red-400 text-sm">
                      ⚠️ This action cannot be undone. The PDF file and all associated data will be permanently deleted.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={closeDeleteModal}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteBook(deleteModal.book!)}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Delete Book'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
      </main>

      <Footer />
    </div>
  );
};

export default Library;
