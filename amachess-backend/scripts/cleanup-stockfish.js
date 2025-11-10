#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cleanup script to remove old Stockfish installation files
 * This script removes the local Stockfish binaries since we're now using API
 */

class StockfishCleanup {
  constructor() {
    this.stockfishDir = path.join(__dirname, '../stockfish');
    this.uploadsDir = path.join(__dirname, '../uploads');
  }

  async cleanup() {
    console.log('🧹 Starting Stockfish cleanup...');
    
    try {
      // Remove stockfish directory if it exists
      if (fs.existsSync(this.stockfishDir)) {
        console.log(`📁 Removing Stockfish directory: ${this.stockfishDir}`);
        await this.removeDirectory(this.stockfishDir);
        console.log('✅ Stockfish directory removed successfully');
      } else {
        console.log('ℹ️  Stockfish directory not found (already clean)');
      }

      // Clean up any temporary files
      const tempFiles = [
        path.join(__dirname, '../stockfish.zip'),
        path.join(__dirname, '../stockfish.tar.gz'),
        path.join(__dirname, '../stockfish-temp')
      ];

      for (const tempFile of tempFiles) {
        if (fs.existsSync(tempFile)) {
          console.log(`🗑️  Removing temporary file: ${tempFile}`);
          if (fs.lstatSync(tempFile).isDirectory()) {
            await this.removeDirectory(tempFile);
          } else {
            fs.unlinkSync(tempFile);
          }
        }
      }

      console.log('✨ Cleanup completed successfully!');
      console.log('');
      console.log('📋 Summary:');
      console.log('  • Removed local Stockfish binaries');
      console.log('  • Cleaned up temporary files');
      console.log('  • System now uses Stockfish API for chess analysis');
      console.log('');
      console.log('🚀 Benefits of API-based approach:');
      console.log('  • Reduced memory usage');
      console.log('  • No platform-specific binaries');
      console.log('  • Always up-to-date engine');
      console.log('  • Better scalability');
      console.log('  • Simplified deployment');

    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    }
  }

  async removeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.lstatSync(filePath);
      
      if (stat.isDirectory()) {
        await this.removeDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
    
    fs.rmdirSync(dirPath);
  }

  showApiInfo() {
    console.log('');
    console.log('🔧 API Configuration:');
    console.log('  The system now uses external Stockfish APIs for analysis.');
    console.log('  Default API: https://stockfish.online/api/s/v2.php');
    console.log('');
    console.log('  To configure a different API, update STOCKFISH_API_URL in your .env file:');
    console.log('  STOCKFISH_API_URL=https://your-preferred-api.com/endpoint');
    console.log('');
    console.log('🧪 Testing:');
    console.log('  Run "npm run test-stockfish-api" to test the API integration');
  }
}

// Run cleanup if called directly
if (require.main === module) {
  const cleanup = new StockfishCleanup();
  cleanup.cleanup().then(() => {
    cleanup.showApiInfo();
  });
}

module.exports = StockfishCleanup;