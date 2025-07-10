/**
 * Frontend Integration Example for PGN Analysis
 * 
 * This example shows how to integrate the PGN analysis backend
 * with your React frontend for chess game analysis.
 */

// Frontend utility functions for PGN analysis
class ChessAnalysisAPI {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  /**
   * Analyze a single PGN game
   * @param {string} pgnString - PGN data to analyze
   * @param {object} options - Analysis options
   * @returns {Promise<object>} Analysis results
   */
  async analyzePGN(pgnString, options = {}) {
    const {
      depth = 15,
      timePerMove = 2000,
      username = null,
      enableCache = true
    } = options;

    try {
      const response = await fetch(`${this.baseURL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pgn: pgnString,
          depth,
          timePerMove,
          username,
          enableCache
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('PGN Analysis Error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Fetch PGN from Lichess and analyze it
   * @param {string} username - Lichess username
   * @param {object} lichessOptions - Options for Lichess API
   * @param {object} analysisOptions - Options for analysis
   * @returns {Promise<object>} Combined PGN and analysis data
   */
  async analyzeLichessGame(username, lichessOptions = {}, analysisOptions = {}) {
    try {
      // Step 1: Fetch PGN from Lichess
      const lichessParams = new URLSearchParams({
        max: lichessOptions.max || 1,
        rated: lichessOptions.rated || 'true',
        ...lichessOptions
      });

      const pgnResponse = await fetch(`${this.baseURL}/api/games/${username}?${lichessParams}`);
      if (!pgnResponse.ok) {
        throw new Error(`Failed to fetch PGN: ${pgnResponse.status}`);
      }

      const pgnData = await pgnResponse.text();
      
      // Step 2: Analyze the fetched PGN
      const analysis = await this.analyzePGN(pgnData, {
        ...analysisOptions,
        username
      });

      return {
        pgn: pgnData,
        analysis,
        source: 'lichess',
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Lichess Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Get analysis cache statistics
   * @returns {Promise<object>} Cache stats
   */
  async getCacheStats() {
    const response = await fetch(`${this.baseURL}/api/analyze/cache/stats`);
    const data = await response.json();
    return data.cache;
  }

  /**
   * Clear analysis cache
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    const response = await fetch(`${this.baseURL}/api/analyze/cache`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}

// React Hook for PGN Analysis
const useChessAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = new ChessAnalysisAPI();

  const analyzePGN = async (pgnString, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.analyzePGN(pgnString, options);
      setAnalysis(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeLichessGame = async (username, lichessOptions = {}, analysisOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.analyzeLichessGame(username, lichessOptions, analysisOptions);
      setAnalysis(result.analysis);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    error,
    analyzePGN,
    analyzeLichessGame,
    clearError: () => setError(null)
  };
};

// Example React Component
const GameAnalysisComponent = ({ pgnString, username }) => {
  const { analysis, loading, error, analyzePGN } = useChessAnalysis();

  useEffect(() => {
    if (pgnString) {
      analyzePGN(pgnString, { 
        username,
        depth: 15,
        timePerMove: 2000
      });
    }
  }, [pgnString, username]);

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="spinner">⏳</div>
        <p>Analyzing game with Stockfish...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-error">
        <h3>Analysis Error</h3>
        <p>{error}</p>
        <button onClick={() => analyzePGN(pgnString, { username })}>
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!analysis) {
    return <div>No analysis available</div>;
  }

  return (
    <div className="game-analysis">
      <h2>Game Analysis Results</h2>
      
      {/* Overall Statistics */}
      <div className="analysis-overview">
        <div className="stat-card">
          <h3>Accuracy</h3>
          <p className="stat-value">{analysis.accuracy}%</p>
        </div>
        <div className="stat-card">
          <h3>Player Side</h3>
          <p className="stat-value">{analysis.playerSide}</p>
        </div>
        <div className="stat-card">
          <h3>Centipawn Loss</h3>
          <p className="stat-value">{analysis.centipawnLoss}</p>
        </div>
      </div>

      {/* Move Quality Breakdown */}
      <div className="move-quality">
        <h3>Move Quality</h3>
        <div className="quality-grid">
          <div className="quality-item excellent">
            <span>Excellent: {analysis.excellentMoves}</span>
          </div>
          <div className="quality-item good">
            <span>Good: {analysis.goodMoves}</span>
          </div>
          <div className="quality-item inaccuracy">
            <span>Inaccuracies: {analysis.inaccuracies}</span>
          </div>
          <div className="quality-item mistake">
            <span>Mistakes: {analysis.mistakes}</span>
          </div>
          <div className="quality-item blunder">
            <span>Blunders: {analysis.blunders}</span>
          </div>
        </div>
      </div>

      {/* Phase Analysis */}
      <div className="phase-analysis">
        <h3>Game Phases</h3>
        <div className="phases">
          <div className="phase">
            <h4>Opening</h4>
            <p>Accuracy: {analysis.phaseAnalysis.opening.accuracy}%</p>
            <p>Moves: {analysis.phaseAnalysis.opening.movesAnalyzed}</p>
          </div>
          <div className="phase">
            <h4>Middlegame</h4>
            <p>Accuracy: {analysis.phaseAnalysis.middlegame.accuracy}%</p>
            <p>Moves: {analysis.phaseAnalysis.middlegame.movesAnalyzed}</p>
          </div>
          <div className="phase">
            <h4>Endgame</h4>
            <p>Accuracy: {analysis.phaseAnalysis.endgame.accuracy}%</p>
            <p>Moves: {analysis.phaseAnalysis.endgame.movesAnalyzed}</p>
          </div>
        </div>
      </div>

      {/* Key Moments */}
      {analysis.keyMoments && analysis.keyMoments.length > 0 && (
        <div className="key-moments">
          <h3>Key Moments</h3>
          {analysis.keyMoments.map((moment, index) => (
            <div key={index} className={`moment ${moment.type}`}>
              <h4>Move {moment.moveNumber}: {moment.move}</h4>
              <p>{moment.description}</p>
              {moment.betterMove && (
                <p>Better: {moment.betterMove}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Game Metadata */}
      <div className="game-metadata">
        <h3>Game Information</h3>
        <p><strong>Opening:</strong> {analysis.openingName}</p>
        <p><strong>Result:</strong> {analysis.result}</p>
        <p><strong>Time Control:</strong> {analysis.timeControl}</p>
        {analysis.performanceRating && (
          <p><strong>Performance Rating:</strong> {analysis.performanceRating}</p>
        )}
      </div>

      {/* Analysis Info */}
      <div className="analysis-info">
        <h3>Analysis Details</h3>
        <p><strong>Depth:</strong> {analysis.analysisInfo.depth}</p>
        <p><strong>Time per Move:</strong> {analysis.analysisInfo.timePerMove}ms</p>
        <p><strong>Analysis Time:</strong> {Math.round(analysis.analysisInfo.analysisTime / 1000)}s</p>
        <p><strong>Generated:</strong> {new Date(analysis.analysisInfo.generatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

// Example usage in a React app
const App = () => {
  const [pgnInput, setPgnInput] = useState('');
  const [username, setUsername] = useState('');
  const { analyzeLichessGame, loading, error } = useChessAnalysis();

  const handleAnalyzeLichess = async () => {
    if (!username.trim()) return;
    
    try {
      const result = await analyzeLichessGame(username, {
        max: 1,
        rated: 'true'
      }, {
        depth: 15,
        timePerMove: 2000
      });
      
      console.log('Analysis completed:', result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div className="app">
      <div className="controls">
        <input
          type="text"
          placeholder="Enter Lichess username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleAnalyzeLichess} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Latest Game'}
        </button>
      </div>

      <div className="pgn-input">
        <textarea
          placeholder="Or paste PGN here..."
          value={pgnInput}
          onChange={(e) => setPgnInput(e.target.value)}
          rows={10}
          cols={80}
        />
      </div>

      {pgnInput && (
        <GameAnalysisComponent pgnString={pgnInput} username={username} />
      )}
    </div>
  );
};

export { ChessAnalysisAPI, useChessAnalysis, GameAnalysisComponent };
export default App;
