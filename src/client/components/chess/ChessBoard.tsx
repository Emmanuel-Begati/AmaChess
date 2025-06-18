import React, { useState } from 'react'
import { RotateCcw, ArrowLeft, ArrowRight, Settings, Maximize2 } from 'lucide-react'

interface ChessBoardProps {
  position?: string // FEN string
  interactive?: boolean
  showCoordinates?: boolean
  orientation?: 'white' | 'black'
  size?: 'small' | 'medium' | 'large'
  onMove?: (move: string) => void
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  interactive = true,
  showCoordinates = true,
  orientation = 'white',
  size = 'medium',
  onMove
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([])

  const files = orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
  const ranks = orientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8']

  const boardSizes = {
    small: 'w-64 h-64',
    medium: 'w-80 h-80',
    large: 'w-96 h-96'
  }

  const squareSizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  // Simple piece representation (you would replace this with actual chess piece components/images)
  const pieceSymbols: { [key: string]: string } = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  }

  const handleSquareClick = (square: string) => {
    if (!interactive) return

    if (selectedSquare === square) {
      setSelectedSquare(null)
      setHighlightedSquares([])
    } else if (selectedSquare && highlightedSquares.includes(square)) {
      // Make move
      const move = `${selectedSquare}${square}`
      onMove?.(move)
      setSelectedSquare(null)
      setHighlightedSquares([])
    } else {
      setSelectedSquare(square)
      // In a real implementation, you would calculate legal moves here
      setHighlightedSquares(['e4', 'e5', 'd4', 'd5']) // Example highlighted squares
    }
  }

  const renderSquare = (file: string, rank: string) => {
    const square = `${file}${rank}`
    const isLight = (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0
    const isSelected = selectedSquare === square
    const isHighlighted = highlightedSquares.includes(square)
    
    // Simple piece placement based on starting position
    const getPiece = (square: string) => {
      if (rank === '8') {
        if (file === 'a' || file === 'h') return '♜'
        if (file === 'b' || file === 'g') return '♞'
        if (file === 'c' || file === 'f') return '♝'
        if (file === 'd') return '♛'
        if (file === 'e') return '♚'
      }
      if (rank === '7') return '♟'
      if (rank === '2') return '♙'
      if (rank === '1') {
        if (file === 'a' || file === 'h') return '♖'
        if (file === 'b' || file === 'g') return '♘'
        if (file === 'c' || file === 'f') return '♗'
        if (file === 'd') return '♕'
        if (file === 'e') return '♔'
      }
      return ''
    }

    return (
      <div
        key={square}
        className={`
          ${squareSizes[size]} flex items-center justify-center cursor-pointer relative
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-500' : ''}
          ${isHighlighted ? 'bg-green-400 bg-opacity-50' : ''}
          hover:bg-opacity-80 transition-all duration-200
        `}
        onClick={() => handleSquareClick(square)}
      >
        <span className="text-2xl select-none">{getPiece(square)}</span>
        
        {/* Square coordinates */}
        {showCoordinates && (
          <>
            {file === files[0] && (
              <span className="absolute left-1 top-1 text-xs font-bold text-gray-700">
                {rank}
              </span>
            )}
            {rank === ranks[ranks.length - 1] && (
              <span className="absolute right-1 bottom-1 text-xs font-bold text-gray-700">
                {file}
              </span>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#272e45] rounded-xl p-6">
      {/* Board Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Chess Position</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-[#374162] hover:bg-[#4a5568] text-white rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#374162] hover:bg-[#4a5568] text-white rounded-lg transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#374162] hover:bg-[#4a5568] text-white rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#374162] hover:bg-[#4a5568] text-white rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#374162] hover:bg-[#4a5568] text-white rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chess Board */}
      <div className="flex justify-center">
        <div className={`${boardSizes[size]} grid grid-cols-8 border-2 border-amber-900 rounded-lg overflow-hidden shadow-2xl`}>
          {ranks.map(rank =>
            files.map(file => renderSquare(file, rank))
          )}
        </div>
      </div>

      {/* Move Information */}
      {interactive && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-400">
            {selectedSquare ? (
              <span>Selected: <span className="text-white font-mono">{selectedSquare}</span></span>
            ) : (
              <span>Click a piece to select</span>
            )}
          </div>
          <div className="text-gray-400">
            <span className="text-white">White</span> to move
          </div>
        </div>
      )}

      {/* Analysis Panel */}
      <div className="mt-4 p-4 bg-[#374162] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-semibold">Position Analysis</h4>
          <span className="text-green-400 text-sm font-medium">+0.3</span>
        </div>
        <div className="text-gray-300 text-sm space-y-1">
          <p><strong>Best move:</strong> e4</p>
          <p><strong>Evaluation:</strong> Slightly better for White</p>
          <p><strong>Material:</strong> Equal</p>
        </div>
      </div>
    </div>
  )
}

export default ChessBoard
