import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import ChessGame from '../components/chess/ChessGame';
import { usePuzzle } from '../hooks/usePuzzle';
import { Chess } from 'chess.js';
import { puzzleService } from '../services/puzzleService';
import { useAuth } from '../contexts/AuthContext';

interface PuzzleTheme {
  name: string;
  count: number;
}

const PuzzleSolver = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showGameAnalysis, setShowGameAnalysis] = useState(false);
  const [engineAnalysis, setEngineAnalysis] = useState<any>(null);
  const [availableThemes, setAvailableThemes] = useState<PuzzleTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>(searchParams.get('theme') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [selectedRating, setSelectedRating] = useState<string>(searchParams.get('rating') || 'all');
  const [puzzleStats, setPuzzleStats] = useState({
    solved: 0,
    accuracy: 0,
    streak: 0,
    averageTime: 0,
    rating: 1200
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const userId = user?.id || 'anonymous';
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  // Board size — driven entirely by the container's actual rendered width
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<number>(280);
  const [isResizing, setIsResizing] = useState(false);
  const RESERVED_DESKTOP = 296;

  const clampBoardSize = useCallback((size: number, containerWidth: number) => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const maxByContainer = containerWidth - 4;
    if (vw < 768) {
      // Mobile: never exceed 38% of vh so controls always fit below
      return Math.max(Math.min(size, maxByContainer, Math.floor(vh * 0.38)), 180);
    }
    if (vw < 1024) {
      // Tablet: fill the column, cap at 70% vh
      return Math.max(Math.min(size, maxByContainer, Math.floor(vh * 0.70)), 280);
    }
    // Desktop
    return Math.max(Math.min(size, maxByContainer, vh - RESERVED_DESKTOP), 280);
  }, []);

  // Use ResizeObserver so we always have the real container width
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setBoardSize(prev => clampBoardSize(prev === 280 ? w : prev, w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [clampBoardSize]);

  const getMaxBoardSize = useCallback(() => {
    const containerW = boardContainerRef.current?.offsetWidth ?? 300;
    return clampBoardSize(9999, containerW);
  }, [clampBoardSize]);

  const getMinBoardSize = useCallback(() => {
    return window.innerWidth < 768 ? 180 : 240;
  }, []);

  const handleResizeDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
    const startData = { x: clientX, y: clientY, size: boardSize };
    setIsResizing(true);

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const cx = 'touches' in ev ? (ev.touches[0]?.clientX ?? 0) : (ev as MouseEvent).clientX;
      const cy = 'touches' in ev ? (ev.touches[0]?.clientY ?? 0) : (ev as MouseEvent).clientY;
      const delta = Math.max(cx - startData.x, cy - startData.y);
      const newSize = Math.min(
        Math.max(startData.size + delta, getMinBoardSize()),
        getMaxBoardSize()
      );
      setBoardSize(Math.round(newSize));
    };

    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [boardSize, getMaxBoardSize, getMinBoardSize]);

  // Use the enhanced puzzle hook
  const {
    puzzle: currentPuzzle,
    isLoading,
    error,
    isCompleted,
    isFailed,
    makeMove,
    loadRandomPuzzle,
    loadPuzzleById,
    showHintAction,
    showSolutionAction,
    resetPuzzle,
    showHint: hintVisible,
    showSolution: solutionVisible,
    gamePosition,
    solvedMoves,
    totalMoves,
    gameContext,
    analysisMode,
    loadGameContext,
    enterAnalysisMode,
    analyzePosition,
    getProgress,
    getTotalUserMoves,
    // Solution mode functionality
    userAttempts,
    solutionMoves,
    solutionModeActive,
    solutionIndex,
    stepSolutionForward,
    stepSolutionBackward,
    exitSolutionMode,
    boardKey
  } = usePuzzle();
  
  // Debug function for testing API connectivity
  const debugAPI = async () => {
    console.log('🔧 DEBUGGING PUZZLE API:');
    console.log('- Current user:', user);
    console.log('- User ID being used:', userId);
    console.log('- Current puzzle:', currentPuzzle);
    
    if (userId === 'anonymous') {
      console.warn('⚠️ User not authenticated - cannot test API');
      return;
    }
    
    // Note: Commented out the test functions as they seem to be causing issues
    // If you need to re-enable them, make sure they're properly imported
    
    // try {
    //   // Test API connectivity
    //   await testPuzzleAPI(userId);
      
    //   // Test puzzle completion if we have a current puzzle
    //   if (currentPuzzle) {
    //     await testPuzzleCompletion(userId, currentPuzzle);
    //   }
    // } catch (error) {
    //   console.error('❌ Debug API test failed:', error);
    // }
  };
  
  // Make debug function available globally for console testing
  useEffect(() => {
    (window as any).debugPuzzleAPI = debugAPI;
    console.log('🔧 Debug function available: window.debugPuzzleAPI()');
  }, [user, currentPuzzle, debugAPI]);

  // Determine board orientation and turn indicator
  const [activeColor, setActiveColor] = useState<'white' | 'black'>('white');

  // Load themes on mount; reload user stats whenever userId resolves from auth
  useEffect(() => {
    loadAvailableThemes();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    loadUserStats();
  }, [isAuthenticated, userId, authLoading]);

  // Handle puzzle loading by ID (separate from filter-based loading)
  useEffect(() => {
    const puzzleId = searchParams.get('id');
    
    console.log('🔍 PuzzleSolver ID useEffect triggered');
    console.log('- Puzzle ID from URL:', puzzleId);
    
    if (puzzleId) {
      console.log('✅ Loading specific puzzle with ID:', puzzleId);
      loadPuzzleById(puzzleId);
    }
  }, [searchParams.get('id')]);

  // Handle filter-based puzzle loading (only when no ID is present)
  useEffect(() => {
    const puzzleId = searchParams.get('id');
    
    // Skip filter-based loading if a puzzle ID is present
    if (puzzleId) {
      console.log('⚠️ Skipping filter-based loading because puzzle ID is present:', puzzleId);
      return;
    }
    
    console.log('🎲 Loading random puzzle with filters');
    const filters = {
      ...(selectedTheme !== 'all' && { themes: [selectedTheme] }),
      ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty as any }),
      ...(selectedRating !== 'all' && { 
        minRating: parseInt(selectedRating) - 100, 
        maxRating: parseInt(selectedRating) + 100 
      })
    };
    console.log('🎯 Applying filters:', filters);
    loadRandomPuzzle(filters);
  }, [selectedTheme, selectedDifficulty, selectedRating, searchParams.get('id')]);
  
  // Load user stats from backend — same approach as Puzzles page
  const loadUserStats = async () => {
    if (isAuthenticated && userId && userId !== 'anonymous') {
      setStatsLoading(true);
      try {
        const stats = await puzzleService.getUserStats(userId);
        setPuzzleStats({
          solved: stats.totalPuzzlesSolved || 0,
          accuracy: Math.round(stats.averageAccuracy || 0),
          streak: stats.currentStreak || 0,
          averageTime: Math.round(stats.averageTimePerPuzzle || 0),
          rating: stats.currentPuzzleRating || 1200
        });
      } catch (error) {
        console.error('❌ Error loading user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    } else {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const puzzleId = searchParams.get('id');
    
    // Only load puzzle with filters if no specific ID is present
    if (!puzzleId) {
      console.log('🔄 Loading puzzle with filters (no ID present)');
      loadPuzzleWithFilters();
    } else {
      console.log('⚠️ Skipping filter-based loading because puzzle ID is present:', puzzleId);
    }
  }, [selectedTheme, selectedDifficulty, selectedRating, searchParams.get('id')]);

  useEffect(() => {
    // Determine board orientation from which side the user is playing
    if (currentPuzzle?.userSide) {
      setActiveColor(currentPuzzle.userSide);
      console.log('User is playing as:', currentPuzzle.userSide);
    } else if (currentPuzzle?.fen) {
      // Fallback to original logic if userSide is not available
      const chess = new Chess(currentPuzzle.fen);
      const turn = chess.turn() === 'w' ? 'white' : 'black';
      // The user plays the opposite side to whoever is to move in the original FEN
      const userSide = turn === 'white' ? 'black' : 'white';
      setActiveColor(userSide);
    }
    
    // Reset tracking variables for new puzzle
    if (currentPuzzle) {
      setPuzzleStartTime(Date.now());
      setHintsUsed(0);
      setSolutionShown(false);
      setIsFirstAttempt(true);
      setHasFailedFirstAttempt(false);
      // Reset puzzle completion/failure tracking for new puzzle
      setLastCompletedPuzzleId(null);
      setLastFailedPuzzleId(null);
    }
  }, [currentPuzzle]);

  // Track puzzle completion state to prevent duplicate updates
  const [lastCompletedPuzzleId, setLastCompletedPuzzleId] = useState<string | null>(null);
  const [lastFailedPuzzleId, setLastFailedPuzzleId] = useState<string | null>(null);
  
  // Track first attempt for ELO rating system
  const [isFirstAttempt, setIsFirstAttempt] = useState<boolean>(true);
  const [hasFailedFirstAttempt, setHasFailedFirstAttempt] = useState<boolean>(false);

  useEffect(() => {
    // Handle puzzle failure after 1 incorrect attempt
    if (isFailed && currentPuzzle && currentPuzzle.id !== lastFailedPuzzleId) {
      const timeSpent = Math.floor((Date.now() - puzzleStartTime) / 1000);
      
      console.log('💔 PUZZLE FAILED! Recording failure...');
      console.log('- Puzzle ID:', currentPuzzle.id);
      console.log('- User ID:', userId);
      console.log('- Time spent:', timeSpent, 'seconds');
      
      // Mark this puzzle as failed to prevent duplicate updates
      setLastFailedPuzzleId(currentPuzzle.id);
      
      // Update backend stats for failed puzzle
      if (userId && userId !== 'anonymous') {
        console.log('📡 Sending failure stats to backend...');
        puzzleService.updateUserStats(
          userId,
          currentPuzzle,
          false, // isCorrect = false (failed)
          timeSpent,
          hintsUsed,
          solutionShown
        ).then((updatedStats) => {
          console.log('✅ Failure stats updated successfully:', updatedStats);
          // Update local stats with real data from backend
          setPuzzleStats(prev => ({
            ...prev,
            accuracy: Math.round(updatedStats.averageAccuracy || prev.accuracy),
            streak: updatedStats.currentStreak || 0, // Should be 0 after failure
            rating: updatedStats.currentPuzzleRating || prev.rating
          }));
          
          // Show notification about the failure and rating change
          if (updatedStats.ratingChange) {
            setNotification({
              type: 'error',
              message: `Puzzle failed! Rating: ${updatedStats.ratingChange > 0 ? '+' : ''}${updatedStats.ratingChange} (Streak reset)`
            });
          } else {
            setNotification({
              type: 'error',
              message: 'Puzzle failed! (Streak reset)'
            });
          }
        }).catch((error) => {
          console.error('❌ Failed to update failure stats:', error);
        });
      }
    }
  }, [isFailed, currentPuzzle, lastFailedPuzzleId, puzzleStartTime, userId, hintsUsed, solutionShown]);

  useEffect(() => {
    // Show notification when puzzle is completed and update backend stats
    // Use isCompleted as the primary indicator, and prevent duplicate updates
    if (isCompleted && currentPuzzle && currentPuzzle.id !== lastCompletedPuzzleId) {
      const timeSpent = Math.floor((Date.now() - puzzleStartTime) / 1000);
      
      console.log('🎯 PUZZLE COMPLETED! Updating stats...');
      console.log('- Puzzle ID:', currentPuzzle.id);
      console.log('- User ID:', userId);
      console.log('- Time spent:', timeSpent, 'seconds');
      console.log('- Solved moves:', solvedMoves);
      console.log('- Total moves:', totalMoves);
      
      // Mark this puzzle as completed to prevent duplicate updates
      setLastCompletedPuzzleId(currentPuzzle.id);

      if (solutionShown) {
        setNotification({
          type: 'info',
          message: `Solution completed.`
        });

        // If they already failed, they already lost points. Don't punish twice.
        if (currentPuzzle.id === lastFailedPuzzleId) return;
        
        // If they gave up without failing, record it as a failure
        if (userId && userId !== 'anonymous') {
          puzzleService.updateUserStats(
            userId,
            currentPuzzle,
            false, // isCorrect = false because they used solution
            timeSpent,
            hintsUsed,
            solutionShown
          ).catch(console.error);
        }
        return;
      }

      setNotification({
        type: 'success',
        message: `Excellent! Puzzle solved in ${timeSpent} seconds!`
      });
      
      
      // Update backend stats
      if (userId && userId !== 'anonymous') {
        console.log('📡 Sending stats update to backend...');
        puzzleService.updateUserStats(
          userId,
          currentPuzzle,
          true, // isCorrect
          timeSpent,
          hintsUsed,
          solutionShown
        ).then((updatedStats) => {
          console.log('✅ User stats updated successfully:', updatedStats);
          // Update local stats with real data from backend
          setPuzzleStats(prev => ({
            ...prev,
            solved: updatedStats.totalPuzzlesSolved || prev.solved + 1,
            accuracy: Math.round(updatedStats.averageAccuracy || prev.accuracy),
            streak: updatedStats.currentStreak || prev.streak + 1,
            rating: updatedStats.currentPuzzleRating || prev.rating
          }));
        }).catch((error) => {
          console.error('❌ Failed to update user stats:', error);
          setNotification({
            type: 'error',
            message: 'Failed to save progress. Please check your connection.'
          });
          // Still update local stats as fallback
          setPuzzleStats(prev => ({
            ...prev,
            solved: prev.solved + 1,
            streak: prev.streak + 1
          }));
        });
      } else {
        console.warn('⚠️ No authenticated user - stats not saved');
        // Update local stats only for anonymous users
        setPuzzleStats(prev => ({
          ...prev,
          solved: prev.solved + 1,
          streak: prev.streak + 1
        }));
      }
    }
  }, [isCompleted, currentPuzzle, puzzleStartTime, userId, hintsUsed, solutionShown, lastCompletedPuzzleId, solvedMoves, totalMoves]);

  useEffect(() => {
    // Show notification for errors
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
    }
  }, [error]);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification]);

  const loadAvailableThemes = async () => {
    try {
      const response = await fetch('/api/puzzles/themes');
      const data = await response.json();
      
      if (data.success) {
        // Format themes with counts (we'll get counts from stats endpoint)
        const statsResponse = await fetch('/api/puzzles/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          const themesWithCounts = data.data.map((theme: string) => ({
            name: theme,
            count: statsData.data.byTheme[theme] || 0
          })).filter((theme: PuzzleTheme) => theme.count > 0)
            .sort((a: PuzzleTheme, b: PuzzleTheme) => b.count - a.count);
          
          setAvailableThemes(themesWithCounts);
        }
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const loadPuzzleWithFilters = async () => {
    const filters: any = {};
    
    if (selectedTheme !== 'all') {
      filters.themes = [selectedTheme];
    }
    
    if (selectedDifficulty !== 'all') {
      filters.difficulty = selectedDifficulty;
    }
    
    if (selectedRating !== 'all') {
      const ratingRanges: { [key: string]: { min: number; max: number } } = {
        'under1400': { min: 0, max: 1400 },
        '1400-1600': { min: 1400, max: 1600 },
        '1600-1800': { min: 1600, max: 1800 },
        '1800-2000': { min: 1800, max: 2000 },
        'over2000': { min: 2000, max: 3000 }
      };
      
      if (ratingRanges[selectedRating]) {
        filters.minRating = ratingRanges[selectedRating].min;
        filters.maxRating = ratingRanges[selectedRating].max;
      }
    }
    
    await loadRandomPuzzle(filters);
  };

  const handleMove = (move: { from: string; to: string; san?: string; promotion?: string }) => {
    if (!currentPuzzle || isCompleted || solutionModeActive) return false;
    
    console.log('PuzzleSolver handleMove called with:', move);
    console.log('First attempt status:', isFirstAttempt);
    
    // Use the puzzle hook's move validation with the move object
    const isCorrect = makeMove({
      from: move.from,
      to: move.to,
      ...(move.promotion && { promotion: move.promotion })
    });
    
    console.log('Move result:', isCorrect);
    
    // Handle incorrect moves with ELO rating system
    if (!isCorrect && error) {
      // Track first attempt failure for ELO rating and streak reset
      if (isFirstAttempt && !hasFailedFirstAttempt) {
        console.log('💔 First attempt failed - will reset streak and apply ELO penalty');
        setHasFailedFirstAttempt(true);
        
        // Update backend with incorrect first attempt
        if (userId && userId !== 'anonymous') {
          const timeSpent = Math.floor((Date.now() - puzzleStartTime) / 1000);
          console.log('📡 Sending first attempt failure to backend...');
          
          puzzleService.updateUserStats(
            userId,
            currentPuzzle,
            false, // isCorrect = false
            timeSpent,
            hintsUsed,
            solutionShown
          ).then((updatedStats) => {
            console.log('✅ First attempt failure processed:', updatedStats);
            // Update local stats to reflect streak reset and rating change
            setPuzzleStats(prev => ({
              ...prev,
              streak: 0, // Reset streak on first attempt failure
              accuracy: Math.round(updatedStats.averageAccuracy || prev.accuracy),
              rating: updatedStats.currentPuzzleRating || prev.rating
            }));
            
            // Show notification about rating change
            if (updatedStats.ratingChange) {
              setNotification({
                type: 'error',
                message: `${error} Rating: ${updatedStats.ratingChange > 0 ? '+' : ''}${updatedStats.ratingChange} (Streak reset)`
              });
            } else {
              setNotification({
                type: 'error',
                message: `${error} (Streak reset)`
              });
            }
          }).catch((backendError) => {
            console.error('❌ Failed to update stats for first attempt failure:', backendError);
            // Still show error and reset streak locally
            setNotification({
              type: 'error',
              message: `${error} (Streak reset)`
            });
            setPuzzleStats(prev => ({
              ...prev,
              streak: 0
            }));
          });
        } else {
          // Anonymous user - just show error and reset streak locally
          setNotification({
            type: 'error',
            message: `${error} (Streak reset)`
          });
          setPuzzleStats(prev => ({
            ...prev,
            streak: 0
          }));
        }
      } else {
        // Subsequent attempts - less severe penalty
        setNotification({
          type: 'error',
          message: error
        });
      }
      
      // Mark that this is no longer the first attempt
      setIsFirstAttempt(false);
    }
    
    // Return the result so ChessBoard knows whether to allow the move
    return isCorrect;
  };

  const loadNextPuzzle = async () => {
    resetPuzzle();
    setNotification(null);
    setShowGameAnalysis(false);
    setEngineAnalysis(null);
    await loadPuzzleWithFilters();
  };

  const handleShowHint = () => {
    showHintAction();
    setHintsUsed(prev => prev + 1);
    setNotification({
      type: 'info',
      message: 'Hint revealed!'
    });
  };

  const handleShowSolution = () => {
    showSolutionAction(); // This starts the interactive solution mode
    setSolutionShown(true);
    setNotification({
      type: 'info',
      message: 'Solution mode activated! Use the controls to step through.'
    });
  };

  const handleAnalyzePosition = async () => {
    setShowGameAnalysis(true);
    enterAnalysisMode();
    await loadGameContext();
    
    // Get Stockfish analysis
    const analysis = await analyzePosition();
    if (analysis) {
      setEngineAnalysis(analysis);
    }
  };

  const progressPercentage = getProgress();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500 text-green-900';
      case 'intermediate':
        return 'bg-yellow-500 text-yellow-900';
      case 'advanced':
        return 'bg-orange-500 text-orange-900';
      case 'expert':
        return 'bg-red-500 text-red-900';
      default:
        return 'bg-gray-500 text-gray-900';
    }
  };

  const getThemeColor = (theme: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
      'bg-orange-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const index = theme.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No puzzle found with current filters</p>
          <button
            onClick={() => {
              setSelectedTheme('all');
              setSelectedDifficulty('all');
              setSelectedRating('all');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white">
      <Header />
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-sm">
          <div className={`px-4 py-3 rounded-lg shadow-lg border-l-4 text-sm ${
            notification.type === 'success' 
              ? 'bg-green-900/90 border-green-400 text-green-100' 
              : notification.type === 'error'
              ? 'bg-red-900/90 border-red-400 text-red-100'
              : 'bg-blue-900/90 border-blue-400 text-blue-100'
          } backdrop-blur-sm`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-2 sm:px-4 pt-20 pb-8 sm:pt-24 max-w-7xl overflow-x-hidden">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight">Puzzle Solver</h1>
            <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Solve tactical puzzles from the Lichess database</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-[#374162] hover:bg-[#455173] rounded-lg transition-colors text-sm"
              title="Filters"
            >
              ⚙️
            </button>
            <button
              onClick={() => navigate('/puzzles')}
              className="px-3 py-2 bg-[#374162] hover:bg-[#455173] rounded-lg transition-colors text-xs sm:text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* ── Filters Panel ── */}
        {showSettings && (
          <div className="mb-4 bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-[#374162]">
            <h3 className="text-base font-semibold text-white mb-3">Puzzle Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Theme</label>
                <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 border border-[#455173] focus:border-blue-400 focus:outline-none text-sm">
                  <option value="all">All Themes</option>
                  {availableThemes.map((theme) => (
                    <option key={theme.name} value={theme.name}>{theme.name} ({theme.count})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Difficulty</label>
                <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 border border-[#455173] focus:border-blue-400 focus:outline-none text-sm">
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner (&lt; 1400)</option>
                  <option value="intermediate">Intermediate (1400-1800)</option>
                  <option value="advanced">Advanced (1800-2200)</option>
                  <option value="expert">Expert (&gt; 2200)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Rating Range</label>
                <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 border border-[#455173] focus:border-blue-400 focus:outline-none text-sm">
                  <option value="all">All Ratings</option>
                  <option value="under1400">Under 1400</option>
                  <option value="1400-1600">1400-1600</option>
                  <option value="1600-1800">1600-1800</option>
                  <option value="1800-2000">1800-2000</option>
                  <option value="over2000">Over 2000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats Bar (desktop: 4 cols, mobile: 2 cols) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-[#272e45] rounded-xl p-3 sm:p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-xs">Solved</p>
            {statsLoading
              ? <div className="h-7 w-10 bg-[#374162] rounded animate-pulse mt-1" />
              : <p className="text-xl sm:text-2xl font-bold text-green-400">{puzzleStats.solved}</p>}
          </div>
          <div className="bg-[#272e45] rounded-xl p-3 sm:p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-xs">My Rating</p>
            {statsLoading
              ? <div className="h-7 w-14 bg-[#374162] rounded animate-pulse mt-1" />
              : <p className="text-xl sm:text-2xl font-bold text-blue-400">{puzzleStats.rating || 1200}</p>}
          </div>
          <div className="bg-[#272e45] rounded-xl p-3 sm:p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-xs">Streak</p>
            {statsLoading
              ? <div className="h-7 w-8 bg-[#374162] rounded animate-pulse mt-1" />
              : <p className="text-xl sm:text-2xl font-bold text-orange-400">{puzzleStats.streak}</p>}
          </div>
          {isCompleted && (
            <div className="bg-[#272e45] rounded-xl p-3 sm:p-4 border border-[#374162] hidden sm:block">
              <p className="text-[#97a1c4] text-xs">Puzzle Rating</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{currentPuzzle.rating}</p>
            </div>
          )}
        </div>

        {/* ── Main layout: Desktop 4-col, Tablet 2-col, Mobile single column ── */}
        <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">

          {/* ── Left panel (tablet + desktop) ── */}
          <div className="hidden md:flex md:col-span-1 flex-col space-y-4">
            <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3 text-sm">
                {solutionModeActive ? 'Solution Moves' : 'Your Attempts'}
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {solutionModeActive ? (
                  solutionMoves.length > 0 ? solutionMoves.map((move, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-green-400">{index + 1}. {move}</span>
                      <span className="text-gray-400">✓</span>
                    </div>
                  )) : <p className="text-gray-400 text-xs">Step through the solution...</p>
                ) : (
                  userAttempts.length > 0 ? userAttempts.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className={attempt.includes('✓') ? 'text-green-400' : 'text-red-400'}>
                        {index + 1}. {attempt.replace(' ✓', '').replace(' (incorrect)', '')}
                      </span>
                      <span className={attempt.includes('✓') ? 'text-green-400' : 'text-red-400'}>
                        {attempt.includes('✓') ? '✓' : '✗'}
                      </span>
                    </div>
                  )) : <p className="text-gray-400 text-xs">Make your moves...</p>
                )}
              </div>
            </div>

            <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3 text-sm">Puzzle Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">ID:</span>
                  <span className="text-white text-xs font-mono">{currentPuzzle.id}</span>
                </div>
                {isCompleted && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#97a1c4]">Rating:</span>
                    <span className="text-white font-bold">{currentPuzzle.rating}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Difficulty:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                    {currentPuzzle.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Moves:</span>
                  <span className="text-white font-medium">{currentPuzzle.moves?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3 text-sm">Themes</h4>
              <div className="flex flex-wrap gap-1.5">
                {currentPuzzle.themes.map((theme, index) => (
                  <span key={index} className={`${getThemeColor(theme)}/20 text-blue-400 px-2 py-0.5 rounded-full text-xs border border-blue-400/30`}>
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Center: Board ── */}
          <div ref={boardContainerRef} className="md:col-span-1 lg:col-span-2 flex flex-col items-center gap-3 min-w-0 w-full overflow-hidden">
            {/* Progress bar */}
            <div className="w-full bg-[#374162] rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }} />
            </div>

            {/* Chess Board with resize handle */}
            <div
              className="relative inline-block select-none max-w-full overflow-hidden"
              style={{ cursor: isResizing ? 'nwse-resize' : 'default', maxWidth: '100%' }}
            >
              <ChessGame
                key={boardKey}
                isModalMode={true}
                position={gamePosition || currentPuzzle.fen}
                onMove={handleMove}
                interactive={(!isCompleted || analysisMode) && !solutionModeActive}
                showNotation={false}
                engineEnabled={analysisMode}
                orientation={activeColor}
                boardWidth={Math.min(boardSize, window.innerWidth - 16)}
                notationFontSize={window.innerWidth < 768 ? '7px' : '10px'}
              />
              {/* Resize handle — bottom-right corner, like Lichess */}
              <div
                onMouseDown={handleResizeDragStart}
                onTouchStart={handleResizeDragStart}
                title="Drag to resize board"
                className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-10 flex items-end justify-end pb-0.5 pr-0.5"
                style={{ touchAction: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-40 hover:opacity-90 transition-opacity">
                  <path d="M13 1L1 13" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M13 6L6 13" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M13 11L11 13" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Solution Display */}
            {solutionVisible && !solutionModeActive && (
              <div className="bg-[#1e293b] rounded-xl p-3 border border-[#374162] w-full">
                <h4 className="text-white font-semibold mb-2 text-sm">Solution:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentPuzzle.moves.map((move, index) => (
                    <span key={index} className="bg-[#374162] text-green-400 px-2 py-0.5 rounded text-xs">
                      {index + 1}. {move}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hint Display */}
            {hintVisible && (
              <div className="bg-[#1e293b] rounded-xl p-3 border border-yellow-400/30 w-full">
                <p className="text-yellow-400 font-medium mb-1 text-sm">💡 Hint:</p>
                <p className="text-white text-sm">{currentPuzzle.hint}</p>
              </div>
            )}

            {/* ── Mobile-only controls below board ── */}
            <div className="md:hidden w-full space-y-3">
              <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                <div className="grid grid-cols-2 gap-2">
                  {!isCompleted && !solutionModeActive && (
                    <>
                      <button onClick={handleShowHint} disabled={hintVisible}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors text-sm">
                        {hintVisible ? 'Hint Shown' : '💡 Hint'}
                      </button>
                      <button onClick={handleShowSolution}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors text-sm">
                        Show Solution
                      </button>
                    </>
                  )}
                  {solutionModeActive && (
                    <>
                      <button onClick={stepSolutionBackward} disabled={solutionIndex <= 0}
                        className="bg-[#374162] hover:bg-[#455173] disabled:opacity-50 text-white py-2 rounded-lg transition-colors text-sm">
                        ← Back
                      </button>
                      <button onClick={stepSolutionForward} disabled={solutionIndex >= currentPuzzle.moves.length}
                        className="bg-[#374162] hover:bg-[#455173] disabled:opacity-50 text-white py-2 rounded-lg transition-colors text-sm">
                        Next →
                      </button>
                      <button onClick={exitSolutionMode}
                        className="col-span-2 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm">
                        Exit Solution
                      </button>
                    </>
                  )}
                  <button onClick={loadNextPuzzle}
                    className={`bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm ${(!isCompleted && !solutionModeActive) ? 'col-span-2' : ''}`}>
                    Next Puzzle →
                  </button>
                  {isCompleted && (
                    <button onClick={handleAnalyzePosition}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors text-sm">
                      Analyze
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile compact puzzle info */}
              <div className="bg-[#272e45] rounded-xl p-3 border border-[#374162]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                    {currentPuzzle.difficulty}
                  </span>
                  <span className="text-[#97a1c4] text-xs">{currentPuzzle.moves?.length || 0} moves</span>
                  <div className="flex flex-wrap gap-1">
                    {currentPuzzle.themes.slice(0, 3).map((theme, index) => (
                      <span key={index} className="text-blue-400 px-2 py-0.5 rounded-full text-xs border border-blue-400/30 bg-blue-600/10">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel (tablet + desktop) ── */}
          <div className="hidden md:flex md:col-span-1 flex-col space-y-4">
            <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3 text-sm">Controls</h4>
              <div className="space-y-2">
                {!isCompleted && !solutionModeActive && (
                  <>
                    <button onClick={handleShowHint} disabled={hintVisible}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm">
                      {hintVisible ? 'Hint Shown' : 'Show Hint'}
                    </button>
                    <button onClick={handleShowSolution}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors text-sm">
                      Show Solution
                    </button>
                  </>
                )}
                {solutionModeActive && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Solution Active</p>
                    <div className="flex gap-2">
                      <button onClick={stepSolutionBackward} disabled={solutionIndex <= 0}
                        className="flex-1 bg-[#374162] hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm">
                        ← Back
                      </button>
                      <button onClick={stepSolutionForward} disabled={solutionIndex >= currentPuzzle.moves.length}
                        className="flex-1 bg-[#374162] hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm">
                        Next →
                      </button>
                    </div>
                    <button onClick={exitSolutionMode}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm">
                      Exit Solution
                    </button>
                  </div>
                )}
                <button onClick={loadNextPuzzle}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm">
                  Next Puzzle
                </button>
                {isCompleted && (
                  <button onClick={handleAnalyzePosition}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors text-sm">
                    Analyze Position
                  </button>
                )}
              </div>
            </div>

            {showGameAnalysis && engineAnalysis && (
              <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                <h4 className="text-white font-semibold mb-3 text-sm">Engine Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Evaluation:</span>
                    <span className="text-white">{engineAnalysis.evaluation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Best Move:</span>
                    <span className="text-green-400">{engineAnalysis.bestMove}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Depth:</span>
                    <span className="text-white">{engineAnalysis.depth}</span>
                  </div>
                </div>
              </div>
            )}

            {gameContext && (
              <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                <h4 className="text-white font-semibold mb-3 text-sm">Game Context</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Game:</span>
                    <a href={currentPuzzle.gameUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline">
                      View on Lichess
                    </a>
                  </div>
                  {gameContext.players && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">White:</span>
                        <span className="text-white">{gameContext.players.white}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">Black:</span>
                        <span className="text-white">{gameContext.players.black}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PuzzleSolver;