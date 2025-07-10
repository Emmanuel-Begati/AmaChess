import type { GameDifficulty } from '../types/chess';

declare global {
  interface Window {
    Stockfish?: () => any;
  }
}

export class StockfishEngine {
  private engine: any = null;
  private isReady = false;
  private onMoveCallback: ((move: string) => void) | null = null;
  private difficulty: GameDifficulty = 5;

  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine(): Promise<void> {
    try {
      // Try to load Stockfish from CDN if not already loaded
      if (!window.Stockfish) {
        await this.loadStockfish();
      }

      if (window.Stockfish) {
        this.engine = window.Stockfish();
        this.setupEngine();
      } else {
        console.warn('Stockfish not available, using random moves');
        this.isReady = true;
      }
    } catch (error) {
      console.error('Failed to initialize Stockfish engine:', error);
      console.log('Falling back to random move generation');
      this.isReady = true;
    }
  }

  private loadStockfish(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stockfish'));
      document.head.appendChild(script);
    });
  }

  private setupEngine(): void {
    if (!this.engine) return;

    this.engine.addMessageListener((message: string) => {
      console.log('Stockfish:', message);
      
      if (message === 'uciok') {
        this.engine.postMessage('isready');
      } else if (message === 'readyok') {
        this.isReady = true;
        this.setDifficulty(this.difficulty);
      } else if (message.startsWith('bestmove')) {
        const move = message.split(' ')[1];
        if (this.onMoveCallback && move !== '(none)') {
          this.onMoveCallback(move);
        }
      }
    });

    this.engine.postMessage('uci');
  }

  public setDifficulty(level: GameDifficulty): void {
    this.difficulty = level;
    
    if (!this.engine || !this.isReady) return;

    // Configure engine strength based on difficulty level
    const skillLevel = Math.min(level * 2, 20); // Scale 1-10 to 2-20
    const depth = Math.min(level + 5, 15); // Scale 1-10 to 6-15
    
    this.engine.postMessage(`setoption name Skill Level value ${skillLevel}`);
    this.engine.postMessage(`setoption name Depth value ${depth}`);
    
    console.log(`Set Stockfish difficulty: Skill Level ${skillLevel}, Depth ${depth}`);
  }

  public async getBestMove(fen: string, onMove: (move: string) => void): Promise<void> {
    this.onMoveCallback = onMove;

    if (!this.engine || !this.isReady) {
      // Fallback to random legal move
      console.log('Using random move (Stockfish not available)');
      setTimeout(() => {
        if (this.onMoveCallback) {
          this.onMoveCallback('random');
        }
      }, 500 + Math.random() * 1000);
      return;
    }

    try {
      // Set position and request best move
      this.engine.postMessage(`position fen ${fen}`);
      
      // Calculate search time based on difficulty
      const thinkTime = Math.min(this.difficulty * 100 + 200, 2000); // 300ms to 2s
      this.engine.postMessage(`go movetime ${thinkTime}`);
      
    } catch (error) {
      console.error('Error getting best move:', error);
      if (this.onMoveCallback) {
        this.onMoveCallback('random');
      }
    }
  }

  public stop(): void {
    if (this.engine) {
      this.engine.postMessage('quit');
    }
  }
}
