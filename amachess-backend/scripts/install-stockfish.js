const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class StockfishInstaller {
  constructor() {
    this.stockfishDir = path.join(__dirname, '../stockfish');
    this.isWindows = process.platform === 'win32';
    this.isLinux = process.platform === 'linux';
    this.isMac = process.platform === 'darwin';
  }

  async install() {
    console.log('🚀 Installing Stockfish chess engine...');
    
    try {
      // Create stockfish directory
      if (!fs.existsSync(this.stockfishDir)) {
        fs.mkdirSync(this.stockfishDir, { recursive: true });
      }

      if (this.isWindows) {
        await this.installWindows();
      } else if (this.isLinux) {
        await this.installLinux();
      } else if (this.isMac) {
        await this.installMac();
      } else {
        throw new Error('Unsupported platform');
      }

      console.log('✅ Stockfish installation completed successfully!');
      await this.testInstallation();
      
    } catch (error) {
      console.error('❌ Stockfish installation failed:', error.message);
      console.log('\n📝 Manual installation instructions:');
      this.printManualInstructions();
    }
  }

  async installWindows() {
    console.log('Installing Stockfish for Windows...');
    
    // Download Stockfish Windows binary
    const downloadUrl = 'https://github.com/official-stockfish/Stockfish/releases/download/sf_15/stockfish_15_win_x64_avx2.zip';
    const zipPath = path.join(this.stockfishDir, 'stockfish.zip');
    
    console.log('Downloading Stockfish binary...');
    await this.downloadFile(downloadUrl, zipPath);
    
    console.log('Extracting Stockfish...');
    // For simplicity, we'll provide instructions for manual extraction
    console.log(`📁 Please extract ${zipPath} to ${this.stockfishDir}`);
    console.log('Make sure the stockfish.exe file is directly in the stockfish folder');
  }

  async installLinux() {
    console.log('Installing Stockfish for Linux...');
    
    try {
      // Try installing via package manager first
      console.log('Attempting to install via apt...');
      await this.runCommand('sudo apt update && sudo apt install -y stockfish');
      
      // Check if installed in system PATH
      try {
        await this.runCommand('which stockfish');
        console.log('✅ Stockfish installed via package manager');
        return;
      } catch (error) {
        console.log('Package manager installation failed, downloading binary...');
      }
    } catch (error) {
      console.log('Package manager not available, downloading binary...');
    }

    // Download binary as fallback
    const downloadUrl = 'https://github.com/official-stockfish/Stockfish/releases/download/sf_15/stockfish_15_linux_x64_avx2.tar';
    const tarPath = path.join(this.stockfishDir, 'stockfish.tar');
    
    await this.downloadFile(downloadUrl, tarPath);
    
    console.log('Extracting Stockfish...');
    await this.runCommand(`cd ${this.stockfishDir} && tar -xf stockfish.tar`);
    
    // Make executable
    const stockfishPath = path.join(this.stockfishDir, 'stockfish');
    if (fs.existsSync(stockfishPath)) {
      fs.chmodSync(stockfishPath, '755');
    }
  }

  async installMac() {
    console.log('Installing Stockfish for macOS...');
    
    try {
      // Try Homebrew first
      console.log('Attempting to install via Homebrew...');
      await this.runCommand('brew install stockfish');
      console.log('✅ Stockfish installed via Homebrew');
      return;
    } catch (error) {
      console.log('Homebrew installation failed, downloading binary...');
    }

    // Download binary as fallback
    const downloadUrl = 'https://github.com/official-stockfish/Stockfish/releases/download/sf_15/stockfish_15_mac_x64_avx2.tar';
    const tarPath = path.join(this.stockfishDir, 'stockfish.tar');
    
    await this.downloadFile(downloadUrl, tarPath);
    
    console.log('Extracting Stockfish...');
    await this.runCommand(`cd ${this.stockfishDir} && tar -xf stockfish.tar`);
    
    // Make executable
    const stockfishPath = path.join(this.stockfishDir, 'stockfish');
    if (fs.existsSync(stockfishPath)) {
      fs.chmodSync(stockfishPath, '755');
    }
  }

  downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          return this.downloadFile(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', (error) => {
          fs.unlink(filepath, () => {}); // Delete incomplete file
          reject(error);
        });
      }).on('error', reject);
    });
  }

  runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true, stdio: 'inherit' });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
      
      child.on('error', reject);
    });
  }

  async testInstallation() {
    console.log('🧪 Testing Stockfish installation...');
    
    const possiblePaths = [
      path.join(this.stockfishDir, 'stockfish.exe'),
      path.join(this.stockfishDir, 'stockfish'),
      'stockfish'
    ];

    for (const stockfishPath of possiblePaths) {
      try {
        const testResult = await this.testStockfishBinary(stockfishPath);
        if (testResult) {
          console.log(`✅ Stockfish is working correctly at: ${stockfishPath}`);
          return;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Stockfish installation test failed');
  }

  testStockfishBinary(binaryPath) {
    return new Promise((resolve, reject) => {
      const child = spawn(binaryPath);
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        console.error('Stockfish stderr:', data.toString());
      });

      child.on('close', (code) => {
        if (output.includes('Stockfish') || output.includes('uciok')) {
          resolve(true);
        } else {
          reject(new Error('Invalid Stockfish binary'));
        }
      });

      child.on('error', reject);

      // Send UCI command to test
      child.stdin.write('uci\n');
      child.stdin.write('quit\n');
      
      // Timeout after 5 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('Test timeout'));
      }, 5000);
    });
  }

  printManualInstructions() {
    console.log('\n📋 Manual Installation Instructions:');
    console.log('=====================================');
    
    if (this.isWindows) {
      console.log('1. Download Stockfish from: https://stockfishchess.org/download/');
      console.log('2. Extract to: ' + this.stockfishDir);
      console.log('3. Ensure stockfish.exe is in the stockfish folder');
    } else if (this.isLinux) {
      console.log('1. Install via package manager: sudo apt install stockfish');
      console.log('2. Or download from: https://stockfishchess.org/download/');
      console.log('3. Extract to: ' + this.stockfishDir);
    } else if (this.isMac) {
      console.log('1. Install via Homebrew: brew install stockfish');
      console.log('2. Or download from: https://stockfishchess.org/download/');
      console.log('3. Extract to: ' + this.stockfishDir);
    }
    
    console.log('\n🔧 After manual installation, test with: npm run test-stockfish');
  }
}

// Run installation if this script is executed directly
if (require.main === module) {
  const installer = new StockfishInstaller();
  installer.install().catch(console.error);
}

module.exports = StockfishInstaller;
