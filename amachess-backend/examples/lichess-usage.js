/**
 * Lichess PGN Fetcher - Example Usage
 * 
 * This script demonstrates how to use the AmaChess backend
 * to fetch PGN games from the Lichess API.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

class LichessPGNFetcher {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Fetch PGN games for a user
   * @param {string} username - Lichess username
   * @param {object} options - Request options
   * @returns {Promise<string>} PGN data
   */
  async getLichessGames(username, options = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/games/${username}`, {
        params: options
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch games: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Fetch games with metadata in JSON format
   * @param {string} username - Lichess username
   * @param {object} options - Request options
   * @returns {Promise<object>} Game data with metadata
   */
  async getLichessGamesWithMetadata(username, options = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/games/${username}/json`, {
        params: options
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch games with metadata: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get cached files for a user
   * @param {string} username - Lichess username
   * @returns {Promise<object>} Cache information
   */
  async getCachedFiles(username) {
    try {
      const response = await axios.get(`${this.baseURL}/games/${username}/cache`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get cached files: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Clear cache for a user
   * @param {string} username - Lichess username
   * @returns {Promise<object>} Clear confirmation
   */
  async clearCache(username) {
    try {
      const response = await axios.delete(`${this.baseURL}/games/${username}/cache`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get API status
   * @returns {Promise<object>} API status information
   */
  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/games/status`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get status: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Example usage
async function demonstrateUsage() {
  const fetcher = new LichessPGNFetcher();

  console.log('🚀 AmaChess Lichess PGN Fetcher Demo\n');

  try {
    // Example 1: Basic PGN fetch
    console.log('📥 Fetching recent games for Magnus Carlsen...');
    const pgnData = await fetcher.getLichessGames('DrNykterstein', {
      max: 5,
      rated: 'true'
    });
    
    console.log(`✅ Fetched PGN data (${pgnData.length} characters)`);
    console.log('First game preview:');
    console.log(pgnData.substring(0, 300) + '...\n');

    // Example 2: Fetch with metadata
    console.log('📊 Fetching games with metadata...');
    const gameData = await fetcher.getLichessGamesWithMetadata('DrNykterstein', {
      max: 3,
      rated: 'true'
    });
    
    console.log(`✅ Fetched ${gameData.gameCount} games`);
    console.log(`📅 Fetched at: ${gameData.fetchedAt}`);
    console.log(`🔧 Options used:`, gameData.options);
    console.log('');

    // Example 3: Check cache
    console.log('💾 Checking cached files...');
    const cacheInfo = await fetcher.getCachedFiles('DrNykterstein');
    console.log(`✅ Found ${cacheInfo.totalFiles} cached files`);
    if (cacheInfo.cachedFiles.length > 0) {
      console.log('Most recent:', cacheInfo.cachedFiles[0].filename);
    }
    console.log('');

    // Example 4: Get API status
    console.log('🔍 Checking API status...');
    const status = await fetcher.getStatus();
    console.log(`✅ API Status: ${status.status}`);
    if (status.user) {
      console.log(`👤 Connected as: ${status.user.username}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   npm run dev');
    }
    
    if (error.message.includes('API token')) {
      console.log('\n💡 Make sure to set your Lichess API token:');
      console.log('   1. Go to https://lichess.org/account/oauth/token');
      console.log('   2. Create a new token');
      console.log('   3. Add it to your .env file as LICHESS_API_TOKEN');
    }
  }
}

// Advanced usage examples
function showAdvancedExamples() {
  console.log('\n📚 Advanced Usage Examples:\n');

  console.log('// Fetch specific time control games');
  console.log(`const blitzGames = await fetcher.getLichessGames('username', {
  max: 20,
  perfType: 'blitz',
  rated: 'true'
});`);

  console.log('\n// Fetch games from a specific time period');
  console.log(`const recentGames = await fetcher.getLichessGames('username', {
  max: 50,
  since: Date.now() - (7 * 24 * 60 * 60 * 1000), // Last week
  rated: 'true'
});`);

  console.log('\n// Fetch games where user played as white');
  console.log(`const whiteGames = await fetcher.getLichessGames('username', {
  max: 30,
  color: 'white',
  rated: 'true'
});`);

  console.log('\n// Fetch games with specific opening');
  console.log(`const sicilianGames = await fetcher.getLichessGames('username', {
  max: 25,
  opening: 'B20', // Sicilian Defense
  rated: 'true'
});`);

  console.log('\n// Error handling example');
  console.log(`try {
  const games = await fetcher.getLichessGames('username');
  // Process games...
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('User does not exist');
  } else if (error.message.includes('Rate limit')) {
    console.log('Too many requests, try again later');
  }
}`);
}

// Run the demonstration
if (require.main === module) {
  demonstrateUsage().then(() => {
    showAdvancedExamples();
    console.log('\n🎉 Demo completed!');
  });
}

module.exports = LichessPGNFetcher;
