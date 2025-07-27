import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { puzzleService, LichessPuzzle, PuzzleFilters } from '../services/puzzleService';

interface PuzzleState {
  currentPuzzle: LichessPuzzle | null;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  isFailed: boolean; // Whether the puzzle has been failed (after 1 incorrect attempt)
  currentMoveIndex: number;
  userMoves: string[];
  showHint: boolean;
  showSolution: boolean;
  gamePosition: string; // Current FEN position during puzzle solving
  chess: Chess | null; // Chess.js instance for move validation
  solvedMoves: number; // Number of moves correctly solved
  totalMoves: number; // Total moves in the puzzle solution
  gameContext: any; // PGN and game information
  analysisMode: boolean; // Whether we're in post-puzzle analysis
  
  // New fields for enhanced functionality
  userAttempts: string[]; // All moves the user has attempted
  solutionMoves: string[]; // Solution moves played so far when showing solution
  solutionModeActive: boolean; // Whether we're stepping through the solution
  solutionIndex: number; // Current position in solution when stepping through
  boardKey: number; // Key to force board re-render when needed
}

export const usePuzzle = () => {
  const [state, setState] = useState<PuzzleState>({
    currentPuzzle: null,
    isLoading: false,
    error: null,
    isCompleted: false,
    isFailed: false,
    currentMoveIndex: 0,
    userMoves: [],
    showHint: false,
    showSolution: false,
    gamePosition: '',
    chess: null,
    solvedMoves: 0,
    totalMoves: 0,
    gameContext: null,
    analysisMode: false,
    userAttempts: [],
    solutionMoves: [],
    solutionModeActive: false,
    solutionIndex: 0,
    boardKey: 0
  });

  // Load a random puzzle with enhanced data
  const loadRandomPuzzle = useCallback(async (filters?: PuzzleFilters) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const puzzle = await puzzleService.getRandomPuzzle(filters);
      
      console.log('=== PUZZLE LOADED ===');
      console.log('Puzzle ID:', puzzle.id);
      console.log('FEN:', puzzle.fen);
      console.log('Moves:', puzzle.moves);
      
      // Initialize chess position from the FEN
      const chess = new Chess(puzzle.fen);
      const sideToMove = chess.turn(); // 'w' or 'b'
      
      console.log('Side to move in FEN:', sideToMove);
      
      // PUZZLE LOGIC:
      // - The FEN shows whose turn it is to move
      // - The first move in the moves array is played by whoever's turn it is in the FEN
      // - The user is always the OPPOSITE side (they respond to what just happened)
      // - We need to play the first move automatically to show what the opponent just did
      
      let currentChess = new Chess(puzzle.fen);
      let currentMoveIndex = 0;
      let userSide: 'white' | 'black';
      
      // Determine which side the user will be playing
      if (sideToMove === 'w') {
        // FEN shows white to move, so white plays first move, user is black
        userSide = 'black';
      } else {
        // FEN shows black to move, so black plays first move, user is white  
        userSide = 'white';
      }
      
      console.log('User will play as:', userSide);
      
      // Auto-play the first move (the opponent's move that the user needs to respond to)
      if (puzzle.moves && puzzle.moves.length > 0) {
        const firstMove = puzzle.moves[0];
        if (firstMove) {
          console.log('Auto-playing first move (opponent):', firstMove);
          
          try {
            const moveObj = currentChess.move({
              from: firstMove.slice(0, 2),
              to: firstMove.slice(2, 4),
              ...(firstMove.slice(4) && { promotion: firstMove.slice(4) })
            });
            
            if (moveObj) {
              currentMoveIndex = 1; // User needs to find move at index 1
              console.log('First move played successfully. User needs to find move:', puzzle.moves[1]);
            } else {
              console.warn('Failed to play first move, starting from original position');
              currentMoveIndex = 0;
            }
          } catch (error) {
            console.warn('Error playing first move:', error);
            currentMoveIndex = 0;
          }
        }
      }
      
      setState(prev => ({
        currentPuzzle: puzzle,
        isLoading: false,
        error: null,
        isCompleted: false,
        isFailed: false,
        currentMoveIndex: currentMoveIndex,
        userMoves: [],
        showHint: false,
        showSolution: false,
        gamePosition: currentChess.fen(),
        chess: currentChess,
        solvedMoves: 0,
        totalMoves: puzzle.moves.length,
        gameContext: null,
        analysisMode: false,
        userAttempts: [],
        solutionMoves: [],
        solutionModeActive: false,
        solutionIndex: 0,
        boardKey: Date.now() // Unique key to force board re-render
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load puzzle'
      }));
    }
  }, []);

  // Load game context (PGN) for the current puzzle
  const loadGameContext = useCallback(async () => {
    if (!state.currentPuzzle) return;
    
    try {
      const response = await fetch(`/api/puzzles/${state.currentPuzzle.id}/context`);
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          gameContext: data.data.gameContext
        }));
      }
    } catch (error) {
      console.warn('Failed to load game context:', error);
    }
  }, [state.currentPuzzle]);

  // Validate a user move with complete puzzle solving
  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (!state.currentPuzzle || !state.chess || state.isCompleted || state.solutionModeActive) return false;

    console.log('=== USER MOVE ATTEMPT ===');
    console.log('Current move index:', state.currentMoveIndex);
    console.log('Total moves in puzzle:', state.totalMoves);
    console.log('User move:', move);

    // Get the current expected move in the solution sequence
    const expectedMove = state.currentPuzzle.moves[state.currentMoveIndex];
    if (!expectedMove) {
      console.log('No expected move found at index', state.currentMoveIndex);
      return false;
    }

    console.log('Expected move:', expectedMove);

    // Create a temporary chess instance to test the move
    const tempChess = new Chess(state.chess.fen());
    
    try {
      // Try to make the user's move
      const userMoveObj = tempChess.move({
        from: move.from,
        to: move.to,
        ...(move.promotion && { promotion: move.promotion })
      });

      if (!userMoveObj) {
        console.log('Invalid move attempted');
        setState(prev => ({ 
          ...prev, 
          error: 'Invalid move!',
          userAttempts: [...prev.userAttempts, `${move.from}${move.to} (invalid)`]
        }));
        return false;
      }

      // Convert the move to UCI format for comparison
      const userUCI = `${userMoveObj.from}${userMoveObj.to}${userMoveObj.promotion || ''}`;
      console.log('User UCI move:', userUCI);
      
      // Normalize expected move (handle different formats)
      let expectedUCI = expectedMove.toLowerCase();
      if (expectedMove.length === 4 || expectedMove.length === 5) {
        expectedUCI = expectedMove.toLowerCase();
      }

      console.log('Expected UCI move:', expectedUCI);

      // Check if this move matches the expected move
      const isCorrect = userUCI.toLowerCase() === expectedUCI;
      console.log('Move is correct:', isCorrect);

      if (!isCorrect) {
        // Mark puzzle as failed after first incorrect attempt
        console.log('INCORRECT MOVE - Marking puzzle as failed');
        setState(prev => ({
          ...prev,
          error: 'Wrong move, try again!',
          isFailed: true, // Mark as failed after 1 incorrect attempt
          userAttempts: [...prev.userAttempts, userUCI + ' (incorrect)'],
          boardKey: prev.boardKey + 1 // Force board re-render to ensure clean state
        }));
        
        // Clear the error after a short delay to allow the user to try again
        setTimeout(() => {
          setState(prev => ({ ...prev, error: null }));
        }, 1500);
        
        return false;
      }

      // Move is correct! Update the position and play the opponent's response
      setState(prev => {
        const newMoveIndex = prev.currentMoveIndex + 1;
        const newUserMoves = [...prev.userMoves, userUCI];
        
        console.log('User move accepted, new move index:', newMoveIndex);
        
        // Create a new chess instance and make the user's move
        const newChess = new Chess(prev.chess!.fen());
        newChess.move({
          from: move.from,
          to: move.to,
          ...(move.promotion && { promotion: move.promotion })
        });

        let currentChess = newChess;
        let currentMoveIndex = newMoveIndex;

        // Auto-play opponent response if there's one
        if (currentMoveIndex < prev.totalMoves) {
          const opponentMove = prev.currentPuzzle!.moves[currentMoveIndex];
          if (opponentMove) {
            console.log('Auto-playing opponent response:', opponentMove);
            try {
              // Parse the opponent move (UCI format)
              const from = opponentMove.slice(0, 2);
              const to = opponentMove.slice(2, 4);
              const promotion = opponentMove.slice(4) || undefined;
              
              const opponentMoveObj = currentChess.move({
                from,
                to,
                ...(promotion && { promotion })
              });
              
              if (opponentMoveObj) {
                currentMoveIndex += 1;
                console.log('Opponent move played, new index:', currentMoveIndex);
              } else {
                console.warn('Failed to play opponent move:', opponentMove);
              }
            } catch (error) {
              console.warn('Error playing opponent move:', error);
            }
          }
        }

        // Check if puzzle is fully completed
        const isFullyCompleted = currentMoveIndex >= prev.totalMoves;
        console.log('Puzzle completed:', isFullyCompleted);
        
        // Count solved moves correctly (only user moves)
        // Since we start at index 1 (after auto-playing first move), 
        // user moves are at indices: 1, 3, 5, etc.
        const userMovesCount = Math.floor((currentMoveIndex + 1) / 2);
        
        return {
          ...prev,
          userMoves: newUserMoves,
          userAttempts: [...prev.userAttempts, userUCI + ' ✓'],
          currentMoveIndex: currentMoveIndex,
          solvedMoves: userMovesCount,
          isCompleted: isFullyCompleted,
          chess: currentChess,
          gamePosition: currentChess.fen(),
          error: null // Clear any previous errors when move is successful
        };
      });

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Invalid move!'
      }));
      return false;
    }
  }, [state.currentPuzzle, state.chess, state.isCompleted, state.currentMoveIndex, state.totalMoves, state.solutionModeActive]);

  // Enter analysis mode after puzzle completion
  const enterAnalysisMode = useCallback(() => {
    setState(prev => ({ ...prev, analysisMode: true }));
    loadGameContext();
  }, [loadGameContext]);

  // Get position analysis from Stockfish
  const analyzePosition = useCallback(async (fen?: string) => {
    const positionToAnalyze = fen || state.gamePosition;
    
    try {
      const response = await fetch('/api/stockfish/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: positionToAnalyze,
          depth: 15
        })
      });
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to analyze position:', error);
      return null;
    }
  }, [state.gamePosition]);

  // Show hint
  const showHint = useCallback(() => {
    setState(prev => ({ ...prev, showHint: true }));
  }, []);

  // Show solution - enters interactive solution mode
  const showSolution = useCallback(() => {
    if (!state.currentPuzzle || !state.chess) return;

    setState(prev => ({
      ...prev,
      showSolution: true,
      solutionModeActive: true,
      solutionIndex: 0,
      solutionMoves: [],
      isCompleted: true
    }));
  }, [state.currentPuzzle, state.chess]);

  // Step forward in solution
  const stepSolutionForward = useCallback(() => {
    if (!state.currentPuzzle || !state.chess || !state.solutionModeActive) return;
    
    const nextMoveIndex = state.solutionIndex;
    if (nextMoveIndex >= state.currentPuzzle.moves.length) return;
    
    const moveToPlay = state.currentPuzzle.moves[nextMoveIndex];
    if (!moveToPlay) return;
    
    try {
      const newChess = new Chess(state.chess.fen());
      const from = moveToPlay.slice(0, 2);
      const to = moveToPlay.slice(2, 4);
      const promotion = moveToPlay.slice(4) || undefined;
      
      const moveObj = newChess.move({
        from,
        to,
        ...(promotion && { promotion })
      });
      
      if (moveObj) {
        setState(prev => ({
          ...prev,
          chess: newChess,
          gamePosition: newChess.fen(),
          solutionIndex: prev.solutionIndex + 1,
          solutionMoves: [...prev.solutionMoves, moveToPlay]
        }));
      }
    } catch (error) {
      console.warn('Failed to play solution move:', error);
    }
  }, [state.currentPuzzle, state.chess, state.solutionModeActive, state.solutionIndex]);

  // Step backward in solution
  const stepSolutionBackward = useCallback(() => {
    if (!state.currentPuzzle || !state.solutionModeActive || state.solutionIndex <= 0) return;
    
    // Reconstruct position by replaying moves from the beginning
    const newChess = new Chess(state.currentPuzzle.fen);
    
    // Replay the initial setup moves if any
    const puzzleFen = state.currentPuzzle.fen;
    const fenParts = puzzleFen.split(' ');
    const sideToMove = fenParts[1];
    
    let startIndex = 0;
    if (sideToMove === 'b') {
      // Auto-play first move (opponent's move) if puzzle starts with black to move
      try {
        const firstMove = state.currentPuzzle.moves[0];
        if (firstMove) {
          const from = firstMove.slice(0, 2);
          const to = firstMove.slice(2, 4);
          const promotion = firstMove.slice(4) || undefined;
        
          newChess.move({
            from,
            to,
            ...(promotion && { promotion })
          });
          startIndex = 1;
        }
      } catch (error) {
        console.warn('Error replaying setup move:', error);
      }
    }
    
    // Replay solution moves up to the previous position
    const targetIndex = state.solutionIndex - 1;
    for (let i = startIndex; i < targetIndex; i++) {
      try {
        const moveToPlay = state.currentPuzzle.moves[i];
        if (moveToPlay) {
          const from = moveToPlay.slice(0, 2);
          const to = moveToPlay.slice(2, 4);
          const promotion = moveToPlay.slice(4) || undefined;
        
          newChess.move({
            from,
            to,
            ...(promotion && { promotion })
          });
        }
      } catch (error) {
        console.warn('Error replaying move:', error);
        break;
      }
    }
    
    setState(prev => ({
      ...prev,
      chess: newChess,
      gamePosition: newChess.fen(),
      solutionIndex: Math.max(0, prev.solutionIndex - 1),
      solutionMoves: prev.solutionMoves.slice(0, -1)
    }));
  }, [state.currentPuzzle, state.solutionModeActive, state.solutionIndex]);

  // Exit solution mode
  const exitSolutionMode = useCallback(() => {
    if (!state.currentPuzzle) return;
    
    // Reset to the original puzzle position
    const newChess = new Chess(state.currentPuzzle.fen);
    
    // Replay the initial setup if needed
    const puzzleFen = state.currentPuzzle.fen;
    const fenParts = puzzleFen.split(' ');
    const sideToMove = fenParts[1];
    
    let currentMoveIndex = 0;
    if (sideToMove === 'b') {
      // Auto-play first move (opponent's move) if puzzle starts with black to move
      try {
        const firstMove = state.currentPuzzle.moves[0];
        if (firstMove) {
          const from = firstMove.slice(0, 2);
          const to = firstMove.slice(2, 4);
          const promotion = firstMove.slice(4) || undefined;
        
          newChess.move({
            from,
            to,
            ...(promotion && { promotion })
          });
          currentMoveIndex = 1;
        }
      } catch (error) {
        console.warn('Error replaying setup move:', error);
      }
    }
    
    setState(prev => ({
      ...prev,
      chess: newChess,
      gamePosition: newChess.fen(),
      currentMoveIndex: currentMoveIndex,
      solutionModeActive: false,
      solutionIndex: 0,
      solutionMoves: [],
      showSolution: false,
      isCompleted: false
    }));
  }, [state.currentPuzzle]);

  // Reset puzzle state
  const resetPuzzle = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCompleted: false,
      isFailed: false,
      currentMoveIndex: 0,
      userMoves: [],
      showHint: false,
      showSolution: false,
      userAttempts: [],
      solutionMoves: [],
      solutionModeActive: false,
      solutionIndex: 0,
      error: null
    }));
  }, []);

  // Get next expected move for hints
  const getNextExpectedMove = useCallback(() => {
    if (!state.currentPuzzle || state.currentMoveIndex >= state.currentPuzzle.moves.length) {
      return null;
    }
    return state.currentPuzzle.moves[state.currentMoveIndex];
  }, [state.currentPuzzle, state.currentMoveIndex]);

  // Get puzzle progress based on user moves completed
  const getProgress = useCallback(() => {
    if (!state.currentPuzzle) return 0;
    // Count only user moves (every other move in the sequence, starting with the first)
    const totalUserMoves = Math.ceil(state.currentPuzzle.moves.length / 2);
    return (state.solvedMoves / totalUserMoves) * 100;
  }, [state.currentPuzzle, state.solvedMoves]);

  return {
    // State
    puzzle: state.currentPuzzle,
    isLoading: state.isLoading,
    error: state.error,
    isCompleted: state.isCompleted,
    isFailed: state.isFailed,
    currentMoveIndex: state.currentMoveIndex,
    userMoves: state.userMoves,
    showHint: state.showHint,
    showSolution: state.showSolution,
    gamePosition: state.gamePosition,
    chess: state.chess,
    solvedMoves: state.solvedMoves,
    totalMoves: state.totalMoves,
    gameContext: state.gameContext,
    analysisMode: state.analysisMode,
    
    // New solution mode state
    userAttempts: state.userAttempts,
    solutionMoves: state.solutionMoves,
    solutionModeActive: state.solutionModeActive,
    solutionIndex: state.solutionIndex,
    boardKey: state.boardKey,
    
    // Actions
    loadRandomPuzzle,
    makeMove,
    showHintAction: showHint,
    showSolutionAction: showSolution,
    resetPuzzle,
    loadGameContext,
    enterAnalysisMode,
    analyzePosition,
    
    // Solution mode actions
    stepSolutionForward,
    stepSolutionBackward,
    exitSolutionMode,
    
    // Computed values
    getNextExpectedMove,
    getProgress,
    
    // Utility functions
    getRemainingMoves: () => state.currentPuzzle ? 
      state.currentPuzzle.moves.length - state.currentMoveIndex : 0,
    getTotalUserMoves: () => state.currentPuzzle ?
      Math.ceil(state.currentPuzzle.moves.length / 2) : 0
  };
};
