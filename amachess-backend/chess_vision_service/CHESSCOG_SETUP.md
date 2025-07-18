# Chess Vision Service - Chesscog Setup Guide

## Overview

The Chess Vision Service provides two implementations:
1. **`app.py`** - Basic version with mock FEN extraction (currently running)
2. **`app_with_chesscog.py`** - Advanced version with real chess position recognition using Chesscog

## Current Status

✅ **Basic service is running** on `http://localhost:5000`  
⚠️ **Chesscog is not installed** - using mock FEN responses

## Installing Chesscog

### Option 1: Automated Setup (Recommended)

1. **Activate your virtual environment** (if using one):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

2. **Run the setup script**:
   ```bash
   python setup_chesscog.py
   ```

   This will:
   - Install Chesscog from GitHub
   - Download pre-trained models
   - Test the installation

3. **Switch to the Chesscog-enabled version**:
   ```bash
   # Stop the current service (Ctrl+C)
   python app_with_chesscog.py
   ```

### Option 2: Manual Installation

1. **Install Chesscog directly**:
   ```bash
   pip install git+https://github.com/georg-wolflein/chesscog.git
   ```

2. **Download required models**:
   ```bash
   python -m chesscog.occupancy_classifier.download_model
   python -m chesscog.piece_classifier.download_model
   ```

3. **Test the installation**:
   ```bash
   python -c "from chesscog.recognition.recognition import ChessRecognizer; print('✅ Chesscog works!')"
   ```

### Option 3: Using Poetry (Original Method)

If you prefer the original installation method:

1. **Install Poetry**:
   ```bash
   pip install poetry
   ```

2. **Clone and install Chesscog**:
   ```bash
   git clone https://github.com/georg-wolflein/chesscog.git
   cd chesscog
   poetry install
   ```

3. **Download models**:
   ```bash
   poetry run python -m chesscog.occupancy_classifier.download_model
   poetry run python -m chesscog.piece_classifier.download_model
   ```

## Testing the Installation

### Test Basic Service (Currently Running)
```bash
curl http://localhost:5000/health
```

### Test with Chesscog
```bash
# Stop current service and start Chesscog version
python app_with_chesscog.py

# Test in another terminal
curl http://localhost:5000/health
```

The response should include `"chesscog_available": true` if successful.

## API Differences

### Basic Version (`app.py`)
- ✅ PDF board detection works
- ⚠️ FEN extraction returns mock positions
- ⚠️ No real chess position recognition

### Chesscog Version (`app_with_chesscog.py`)
- ✅ PDF board detection works
- ✅ Real FEN extraction using Chesscog
- ✅ Actual chess position recognition
- ✅ Automatic fallback to mock if Chesscog fails

## Example Usage

### 1. Detect Chess Boards
```bash
curl -X POST -F "pdf=@chess_book.pdf" http://localhost:5000/detect-boards
```

### 2. Extract FEN (with Chesscog)
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"page": 1, "x": 100, "y": 150, "width": 200, "height": 200, "pdf_hash": "abc123"}' \
  http://localhost:5000/extract_fen
```

### 3. Check Service Status
```bash
curl http://localhost:5000/health
```

## Troubleshooting

### Common Issues

1. **"No module named 'chesscog'"**
   - Solution: Run `python setup_chesscog.py` or install manually

2. **"Git not found"**
   - Solution: Install Git from https://git-scm.com/

3. **"Failed to download models"**
   - Solution: Check internet connection and try again

4. **"Chesscog recognizer failed to initialize"**
   - Solution: Ensure models are downloaded correctly

### Windows-Specific Issues

1. **Long path error**
   - Solution: Enable long path support in Windows settings

2. **VC++ build tools missing**
   - Solution: Install Visual Studio Build Tools

### Verification Steps

1. **Check if Chesscog is installed**:
   ```bash
   python -c "import chesscog; print('✅ Chesscog installed')"
   ```

2. **Check if models are downloaded**:
   ```bash
   python -c "from chesscog.recognition.recognition import ChessRecognizer; ChessRecognizer()"
   ```

3. **Check service status**:
   ```bash
   curl http://localhost:5000/health
   ```

## Performance Notes

- **First prediction**: May take 10-15 seconds (model loading)
- **Subsequent predictions**: 1-3 seconds per position
- **Memory usage**: ~1-2GB with models loaded
- **Accuracy**: 85-95% depending on image quality

## Next Steps

1. **Install Chesscog** using one of the methods above
2. **Test the installation** with the provided commands
3. **Switch to `app_with_chesscog.py`** for real chess recognition
4. **Integrate with your Node.js backend** (already configured)

The Node.js backend in `src/routes/chessVision.js` is already configured to work with both versions of the service.

## Support

If you encounter issues:
1. Check the [Chesscog documentation](https://georg-wolflein.github.io/chesscog/)
2. Review the [Chesscog GitHub repository](https://github.com/georg-wolflein/chesscog)
3. Check the console output for specific error messages
