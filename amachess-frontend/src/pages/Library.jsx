import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Library = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedBooks, setUploadedBooks] = useState([
    {
      id: 1,
      title: "My Chess Analysis Collection",
      author: "Personal",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhNa659kTSWrdMrx4Cg3AFY4fVwpPmxArYR8jgncLncxzQPnOto3sNwmNgYFl78be-zxwGZHYrnN73JVMxa3WHoXm3DO2z1WoY42sYwyp8a5iaEjVEZoUYYdrYuEl6kRmsulFWnVuDhlKn6iXYdn0aJSiFqqnIrpRilLuDM5ErDegu3weF7fbs-xFSHGS7eV5TO1jXJO6MuLY1Thwzz1PnHCNqgOx3WoDBva6Mww16cGgFBnZgtaxsyTELhhbBCp4Shl0xEpHc5Rs",
      uploadDate: "2025-01-15",
      positions: 45
    }
  ]);

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

  // Authentication check
  useEffect(() => {
    // In a real app, you'd check for actual authentication token/session
    // For this demo, we'll simulate checking if user is "logged in"
    const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true' || 
                           document.referrer.includes('/dashboard');
    
    if (!isAuthenticated) {
      // Set authentication flag for library access
      localStorage.setItem('userAuthenticated', 'true');
    }
  }, []);

  const handleBookClick = (book) => {
    // Set authentication flag before navigating to book
    localStorage.setItem('userAuthenticated', 'true');
    navigate(`/library/book/${book.id}`, { state: { book } });
  };

  const handleUploadBook = (file) => {
    // This would handle the actual file upload in a real implementation
    const newBook = {
      id: Date.now(),
      title: file.name.replace('.pdf', ''),
      author: "Personal",
      cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhNa659kTSWrdMrx4Cg3AFY4fVwpPmxArYR8jgncLncxzQPnOto3sNwmNgYFl78be-zxwGZHYrnN73JVMxa3WHoXm3DO2z1WoY42sYwyp8a5iaEjVEZoUYYdrYuEl6kRmsulFWnVuDhlKn6iXYdn0aJSiFqqnIrpRilLuDM5ErDegu3weF7fbs-xFSHGS7eV5TO1jXJO6MuLY1Thwzz1PnHCNqgOx3WoDBva6Mww16cGgFBnZgtaxsyTELhhbBCp4Shl0xEpHc5Rs",
      uploadDate: new Date().toISOString().split('T')[0],
      positions: Math.floor(Math.random() * 100) + 20
    };
    setUploadedBooks([...uploadedBooks, newBook]);
    setShowUploadModal(false);
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
    <div className="relative flex size-full min-h-screen flex-col bg-[#121621] dark group/design-root overflow-x-hidden" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">Library</p>
                <p className="text-[#97a1c4] text-sm font-normal leading-normal">
                  Explore a vast collection of chess literature, from classic treatises to modern analyses, enriched with interactive features and community insights.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Book
                </button>
              </div>
            </div>
            
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div
                    className="text-[#97a1c4] flex border-none bg-[#272e45] items-center justify-center pl-4 rounded-l-lg border-r-0"
                    data-icon="MagnifyingGlass"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search for books, authors, or topics"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#272e45] focus:border-none h-full placeholder:text-[#97a1c4] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    defaultValue=""
                  />
                </div>
              </label>
            </div>
            
            <div className="pb-3">
              <div className="flex border-b border-[#374162] px-4 gap-8">
                {['All', 'My Library', 'Featured', 'Popular'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                      activeTab === tab
                        ? 'border-b-blue-800 text-white'
                        : 'border-b-transparent text-[#97a1c4] hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">{tab}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {activeTab === 'My Library' && uploadedBooks.length > 0 && (
              <>
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">My Uploaded Books</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  {uploadedBooks.map((book) => (
                    <div key={book.id} className="flex flex-col gap-3 pb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleBookClick(book)}>
                      <div
                        className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg"
                        style={{backgroundImage: `url("${book.cover}")`}}
                      ></div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">{book.title}</p>
                        <p className="text-[#97a1c4] text-sm font-normal leading-normal">{book.author}</p>
                        <p className="text-[#97a1c4] text-xs font-normal leading-normal">
                          {book.positions} positions • Uploaded {book.uploadDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(activeTab === 'All' || activeTab === 'Featured') && (
              <>
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Books</h2>
                <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex items-stretch p-4 gap-3">
                    {featuredBooks.map((book) => (
                      <div key={book.id} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleBookClick(book)}>
                        <div
                          className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg flex flex-col"
                          style={{backgroundImage: `url("${book.cover}")`}}
                        ></div>
                        <div>
                          <p className="text-white text-base font-medium leading-normal">{book.title}</p>
                          <p className="text-[#97a1c4] text-sm font-normal leading-normal">{book.author}</p>
                          {book.positions > 0 && (
                            <p className="text-[#97a1c4] text-xs font-normal leading-normal">{book.positions} positions</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(activeTab === 'All' || activeTab === 'Popular') && (
              <>
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Community Favorites</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  {communityFavorites.map((book) => (
                    <div key={book.id} className="flex flex-col gap-3 pb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleBookClick(book)}>
                      <div
                        className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg"
                        style={{backgroundImage: `url("${book.cover}")`}}
                      ></div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">{book.title}</p>
                        <p className="text-[#97a1c4] text-sm font-normal leading-normal">{book.author}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-[#97a1c4] text-xs ml-1">{book.rating}</span>
                          </div>
                          <span className="text-[#97a1c4] text-xs">• {book.positions} positions</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121621] rounded-xl max-w-lg w-full p-6 border border-[#374162]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Upload Chess Book</h3>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="text-[#97a1c4] hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-[#374162] rounded-lg p-8 text-center">
                    <svg className="w-12 h-12 text-[#97a1c4] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-white font-medium mb-2">Drag and drop your chess book</p>
                    <p className="text-[#97a1c4] text-sm mb-4">or click to browse files</p>
                    <input
                      type="file"
                      accept=".pdf,.epub,.mobi"
                      onChange={(e) => e.target.files[0] && handleUploadBook(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Choose File
                    </label>
                    <p className="text-[#97a1c4] text-xs mt-2">Supports PDF, EPUB, MOBI formats</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Library;
