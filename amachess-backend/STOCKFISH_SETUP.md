# Stockfish Installation Guide

## Automatic Installation (Recommended)

1. Run the installation script:
   ```bash
   npm run install-stockfish
   ```

## Manual Installation (Windows)

If the automatic installation fails, follow these steps:

1. **Download Stockfish:**
   - Go to https://stockfishchess.org/download/
   - Download "Stockfish 15 for Windows" (stockfish_15_win_x64_avx2.zip)

2. **Extract and Setup:**
   - Extract the downloaded ZIP file
   - Copy the `stockfish.exe` file to: `amachess-backend/stockfish/stockfish.exe`
   - Make sure the path is exactly: `amachess-backend/stockfish/stockfish.exe`

3. **Test Installation:**
   ```bash
   npm run test-stockfish
   ```

## Manual Installation (Linux/Mac)

### Linux:
```bash
sudo apt update
sudo apt install stockfish
```

### macOS:
```bash
brew install stockfish
```

## Verify Installation

After installation, test that Stockfish is working:

```bash
npm run test-stockfish
```

If successful, you should see output like:
```
✅ Analysis result: { bestMove: 'e2e4', evaluation: { type: 'centipawn', value: 31 } }
✅ Coach move result: { move: 'e2e4', evaluation: { type: 'centipawn', value: 31 } }
🎉 All Stockfish tests passed successfully!
```

## Troubleshooting

1. **"Stockfish not found" error:**
   - Make sure stockfish.exe is in the stockfish folder
   - Or install Stockfish globally and add to PATH

2. **Permission errors (Linux/Mac):**
   ```bash
   chmod +x stockfish/stockfish
   ```

3. **Still not working:**
   - Check that you have the correct architecture (x64)
   - Try downloading a different Stockfish version
   - Restart your terminal/command prompt
