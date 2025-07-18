import React, { useState } from 'react';
import { stockfishAPI, formatEvaluation, type DifficultyLevel } from '../utils/stockfish';

const StockfishTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await stockfishAPI.checkHealth();
      const test = await stockfishAPI.testStockfish();
      setResult({ health, test });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getBestMove = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing backend Stockfish with:', { fen, difficulty });
      const move = await stockfishAPI.getBestMove(fen, difficulty, 3000);
      console.log('Backend response:', move);
      setResult(move);
    } catch (err) {
      console.error('Backend error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const analyzePosition = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Analyzing position with backend:', fen);
      const analysis = await stockfishAPI.analyzePosition(fen, 15, 2000);
      console.log('Analysis result:', analysis);
      setResult(analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stockfish Test Component</h1>
      
      <div className="space-y-4">
        {/* Connection Test */}
        <div>
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Stockfish Connection'}
          </button>
        </div>

        {/* FEN Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            FEN Position:
          </label>
          <input
            type="text"
            value={fen}
            onChange={(e) => setFen(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter FEN position"
          />
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty:
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
            <option value="maximum">Maximum</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-x-2">
          <button
            onClick={getBestMove}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Get Best Move'}
          </button>
          
          <button
            onClick={analyzePosition}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Position'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.bestMove && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p><strong>Best Move:</strong> {result.bestMove}</p>
                {result.evaluation && (
                  <p><strong>Evaluation:</strong> {formatEvaluation(result.evaluation)}</p>
                )}
                {result.difficulty && (
                  <p><strong>Difficulty:</strong> {result.difficulty}</p>
                )}
                {result.timeUsed && (
                  <p><strong>Time Used:</strong> {result.timeUsed}ms</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockfishTest;
