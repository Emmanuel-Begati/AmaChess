import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Target, 
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react'

interface Position {
  id: string
  title: string
  description: string
  fen: string
  solution: string[]
  difficulty: number
  category: string
  points: number
}

interface PracticeModeProps {
  positions?: Position[]
  onComplete?: (score: number) => void
}

const PracticeMode: React.FC<PracticeModeProps> = ({ 
  positions = [],
  onComplete 
}) => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [userMoves, setUserMoves] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [isActive, setIsActive] = useState(false)

  // Sample positions for demo
  const samplePositions: Position[] = [
    {
      id: '1',
      title: 'Fork Tactic',
      description: 'Find the knight fork that wins material',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R',
      solution: ['Nf7+', 'Kh8', 'Nxd8'],
      difficulty: 2,
      category: 'Tactics',
      points: 100
    },
    {
      id: '2',
      title: 'Endgame Technique',
      description: 'Convert this king and pawn endgame to a win',
      fen: '8/8/8/8/3k4/8/3K1P2/8',
      solution: ['Kd3', 'Ke5', 'f4+'],
      difficulty: 3,
      category: 'Endgames',
      points: 150
    }
  ]

  const practicePositions = positions.length > 0 ? positions : samplePositions
  const currentPosition = practicePositions[currentPositionIndex]

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(time => time + 1)
      }, 1000)
    } else if (!isActive && timeSpent !== 0) {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeSpent])

  const handleStart = () => {
    setIsActive(true)
    setTimeSpent(0)
    setScore(0)
    setCurrentPositionIndex(0)
    setUserMoves([])
    setIsCorrect(null)
    setShowHint(false)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeSpent(0)
    setScore(0)
    setCurrentPositionIndex(0)
    setUserMoves([])
    setIsCorrect(null)
    setShowHint(false)
  }

  const handleMove = (move: string) => {
    const newMoves = [...userMoves, move]
    setUserMoves(newMoves)

    // Check if the move sequence matches the solution
    const solution = currentPosition.solution
    const isSequenceCorrect = newMoves.every((move, index) => 
      move === solution[index]
    )

    if (newMoves.length === solution.length && isSequenceCorrect) {
      setIsCorrect(true)
      setScore(prev => prev + currentPosition.points)
      setTimeout(() => {
        nextPosition()
      }, 2000)
    } else if (!isSequenceCorrect) {
      setIsCorrect(false)
      setTimeout(() => {
        setUserMoves([])
        setIsCorrect(null)
      }, 2000)
    }
  }

  const nextPosition = () => {
    if (currentPositionIndex < practicePositions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1)
      setUserMoves([])
      setIsCorrect(null)
      setShowHint(false)
    } else {
      // Practice session complete
      setIsActive(false)
      onComplete?.(score)
    }
  }

  const previousPosition = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1)
      setUserMoves([])
      setIsCorrect(null)
      setShowHint(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400'
    if (difficulty <= 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner'
    if (difficulty <= 3) return 'Intermediate'
    return 'Advanced'
  }

  return (
    <div className="bg-[#272e45] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Interactive Practice</h2>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-white font-mono">{formatTime(timeSpent)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Position Info */}
      <div className="mb-6 p-4 bg-[#121621] rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-lg">{currentPosition.title}</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Position {currentPositionIndex + 1} of {practicePositions.length}
            </span>
            <span className={`font-medium ${getDifficultyColor(currentPosition.difficulty)}`}>
              {getDifficultyText(currentPosition.difficulty)}
            </span>
            <span className="text-blue-400">{currentPosition.points} pts</span>
          </div>
        </div>
        
        <p className="text-gray-300 mb-3">{currentPosition.description}</p>
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-[#374162] text-gray-300 text-xs rounded">
            {currentPosition.category}
          </span>
          {userMoves.length > 0 && (
            <span className="text-gray-400 text-sm">
              Moves: {userMoves.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Chess Board Placeholder */}
      <div className="mb-6 bg-[#374162] rounded-lg p-8 min-h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Interactive Chess Board</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Chess board component would be rendered here with the position: {currentPosition.fen}
          </p>
          
          {/* Demo Move Buttons */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {['Nf7+', 'Qd5', 'Bd4', 'Re8'].map((move) => (
              <button
                key={move}
                onClick={() => handleMove(move)}
                className="px-3 py-2 bg-[#272e45] hover:bg-[#374162] text-white rounded-lg text-sm font-medium transition-colors"
                disabled={isCorrect !== null}
              >
                {move}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {isCorrect !== null && (
        <div className={`mb-6 p-4 rounded-lg ${
          isCorrect ? 'bg-green-600/20 border border-green-600' : 'bg-red-600/20 border border-red-600'
        }`}>
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <div>
              <h4 className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h4>
              <p className="text-gray-300 text-sm">
                {isCorrect 
                  ? `Great job! You earned ${currentPosition.points} points.`
                  : 'Try again. Consider the position more carefully.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-semibold mb-1">Hint</h4>
              <p className="text-gray-300 text-sm">
                Look for forcing moves first. The first move in the solution is: {currentPosition.solution[0]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Practice
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={previousPosition}
            disabled={currentPositionIndex === 0}
            className="flex items-center gap-2 bg-[#374162] hover:bg-[#4a5568] text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Hint
          </button>
          
          <button
            onClick={nextPosition}
            disabled={currentPositionIndex === practicePositions.length - 1}
            className="flex items-center gap-2 bg-[#374162] hover:bg-[#4a5568] text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">
            {Math.round(((currentPositionIndex + 1) / practicePositions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-[#374162] rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPositionIndex + 1) / practicePositions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Session Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-[#121621] rounded-lg p-3 text-center">
          <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-white font-semibold">{score}</div>
          <div className="text-gray-400 text-xs">Total Score</div>
        </div>
        <div className="bg-[#121621] rounded-lg p-3 text-center">
          <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-white font-semibold">{currentPositionIndex}</div>
          <div className="text-gray-400 text-xs">Completed</div>
        </div>
        <div className="bg-[#121621] rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-white font-semibold">{formatTime(timeSpent)}</div>
          <div className="text-gray-400 text-xs">Time</div>
        </div>
      </div>
    </div>
  )
}

export default PracticeMode
