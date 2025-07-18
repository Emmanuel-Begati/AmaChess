"""
Chess Vision Service with Mock Implementation
A Flask service for chess board detection and FEN extraction from PDFs.
"""

import os
import hashlib
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path
from PIL import Image
import io

# Try to import real chesscog, fallback to mock
try:
    import chesscog
    print("Using real chesscog library")
    CHESSCOG_AVAILABLE = True
except ImportError:
    print("Real chesscog not available, using mock implementation")
    import mock_chesscog as chesscog
    CHESSCOG_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
CACHE_FOLDER = 'pdf_cache'
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'pdf'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_hash(file_path: str) -> str:
    """Generate MD5 hash of a file."""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def cache_pdf_pages(pdf_path: str) -> Dict:
    """Convert PDF to images and cache them."""
    try:
        file_hash = get_file_hash(pdf_path)
        cache_dir = os.path.join(CACHE_FOLDER, file_hash)
        
        # Check if already cached
        if os.path.exists(cache_dir):
            cache_info_path = os.path.join(cache_dir, 'cache_info.json')
            if os.path.exists(cache_info_path):
                with open(cache_info_path, 'r') as f:
                    cache_info = json.load(f)
                logger.info(f"Using cached PDF images for {file_hash}")
                return cache_info
        
        # Create cache directory
        os.makedirs(cache_dir, exist_ok=True)
        
        # Convert PDF to images
        logger.info(f"Converting PDF to images: {pdf_path}")
        images = convert_from_path(pdf_path, dpi=200)
        
        # Save images to cache
        page_files = []
        for i, image in enumerate(images):
            page_file = os.path.join(cache_dir, f'page_{i+1}.png')
            image.save(page_file, 'PNG')
            page_files.append(page_file)
            logger.info(f"Cached page {i+1} to {page_file}")
        
        # Save cache info
        cache_info = {
            'file_hash': file_hash,
            'total_pages': len(images),
            'page_files': page_files,
            'created_at': datetime.now().isoformat(),
            'pdf_path': pdf_path
        }
        
        cache_info_path = os.path.join(cache_dir, 'cache_info.json')
        with open(cache_info_path, 'w') as f:
            json.dump(cache_info, f, indent=2)
        
        logger.info(f"PDF cached successfully: {len(images)} pages")
        return cache_info
        
    except Exception as e:
        logger.error(f"Error caching PDF: {str(e)}")
        raise

def detect_chessboard_contours(image: np.ndarray) -> List[Dict]:
    """
    Detect chessboard-like rectangular contours in an image.
    Returns a list of detected rectangles with their coordinates.
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detected_boards = []
        
        for contour in contours:
            # Calculate contour area
            area = cv2.contourArea(contour)
            
            # Filter by area (chessboards should be reasonably sized)
            if area < 1000 or area > image.shape[0] * image.shape[1] * 0.8:
                continue
            
            # Approximate contour to polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Look for rectangular shapes (4 corners)
            if len(approx) == 4:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(approx)
                
                # Check aspect ratio (chessboards should be roughly square)
                aspect_ratio = w / h
                if 0.8 <= aspect_ratio <= 1.2:
                    detected_boards.append({
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h),
                        'area': int(area),
                        'aspect_ratio': round(aspect_ratio, 2)
                    })
        
        # Sort by area (largest first)
        detected_boards.sort(key=lambda x: x['area'], reverse=True)
        
        logger.info(f"Detected {len(detected_boards)} potential chessboards")
        return detected_boards
        
    except Exception as e:
        logger.error(f"Error detecting chessboards: {str(e)}")
        return []

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'chesscog_available': CHESSCOG_AVAILABLE,
        'version': '1.0.0'
    })

@app.route('/detect-boards', methods=['POST'])
def detect_boards():
    """
    Detect chessboards in a PDF file.
    Returns coordinates of detected chessboards for each page.
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = str(int(datetime.now().timestamp() * 1000))
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        logger.info(f"Processing PDF: {file_path}")
        
        # Cache PDF pages
        cache_info = cache_pdf_pages(file_path)
        
        # Process each page
        results = []
        for page_num in range(cache_info['total_pages']):
            page_file = cache_info['page_files'][page_num]
            
            # Load image
            image = cv2.imread(page_file)
            if image is None:
                logger.error(f"Could not load image: {page_file}")
                continue
            
            # Detect chessboards
            boards = detect_chessboard_contours(image)
            
            page_result = {
                'page': page_num + 1,
                'boards': boards,
                'total_boards': len(boards)
            }
            results.append(page_result)
            
            logger.info(f"Page {page_num + 1}: Found {len(boards)} potential chessboards")
        
        # Clean up uploaded file
        try:
            os.remove(file_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'total_pages': cache_info['total_pages'],
            'file_hash': cache_info['file_hash'],
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in detect_boards: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/extract-fen', methods=['POST'])
def extract_fen():
    """
    Extract FEN notation from a specific region of a PDF page.
    Expects JSON: { "file_hash": "...", "page": 1, "x": 100, "y": 100, "width": 200, "height": 200 }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        required_fields = ['file_hash', 'page', 'x', 'y', 'width', 'height']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        file_hash = data['file_hash']
        page = data['page']
        x = data['x']
        y = data['y']
        width = data['width']
        height = data['height']
        
        # Find cached page
        cache_dir = os.path.join(CACHE_FOLDER, file_hash)
        if not os.path.exists(cache_dir):
            return jsonify({'error': 'PDF not found in cache. Please upload the PDF first.'}), 404
        
        # Load cache info
        cache_info_path = os.path.join(cache_dir, 'cache_info.json')
        if not os.path.exists(cache_info_path):
            return jsonify({'error': 'Cache info not found'}), 404
        
        with open(cache_info_path, 'r') as f:
            cache_info = json.load(f)
        
        # Validate page number
        if page < 1 or page > cache_info['total_pages']:
            return jsonify({'error': f'Invalid page number. Must be between 1 and {cache_info["total_pages"]}'}), 400
        
        # Load page image
        page_file = cache_info['page_files'][page - 1]
        image = cv2.imread(page_file)
        if image is None:
            return jsonify({'error': f'Could not load page image: {page_file}'}), 500
        
        # Validate coordinates
        img_height, img_width = image.shape[:2]
        if x < 0 or y < 0 or x + width > img_width or y + height > img_height:
            return jsonify({'error': 'Invalid coordinates. Region extends beyond image bounds.'}), 400
        
        # Crop the region
        cropped = image[y:y+height, x:x+width]
        
        logger.info(f"Extracting FEN from page {page}, region ({x}, {y}, {width}, {height})")
        
        # Extract FEN using chesscog (or mock)
        try:
            if CHESSCOG_AVAILABLE:
                # Use real chesscog
                fen = chesscog.predict_fen(cropped)
                analysis = chesscog.get_board_classification(cropped)
            else:
                # Use mock implementation
                fen = chesscog.predict_fen(cropped)
                analysis = chesscog.get_board_classification(cropped)
            
            # Validate FEN
            is_valid = chesscog.is_valid_fen(fen) if fen else False
            
            result = {
                'success': True,
                'fen': fen,
                'valid_fen': is_valid,
                'analysis': analysis,
                'region': {
                    'page': page,
                    'x': x,
                    'y': y,
                    'width': width,
                    'height': height
                },
                'chesscog_available': CHESSCOG_AVAILABLE,
                'timestamp': datetime.now().isoformat()
            }
            
            if fen and is_valid:
                result['board_description'] = chesscog.fen_to_board_description(fen)
            
            logger.info(f"FEN extraction successful: {fen}")
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error extracting FEN: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'FEN extraction failed: {str(e)}',
                'fen': None,
                'chesscog_available': CHESSCOG_AVAILABLE,
                'timestamp': datetime.now().isoformat()
            }), 500
        
    except Exception as e:
        logger.error(f"Error in extract_fen: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/test-chesscog', methods=['GET'])
def test_chesscog():
    """Test chesscog functionality."""
    try:
        # Create a test image
        test_image = np.zeros((400, 400, 3), dtype=np.uint8)
        
        # Test FEN prediction
        fen = chesscog.predict_fen(test_image)
        analysis = chesscog.get_board_classification(test_image)
        
        return jsonify({
            'chesscog_available': CHESSCOG_AVAILABLE,
            'test_fen': fen,
            'test_analysis': analysis,
            'fen_valid': chesscog.is_valid_fen(fen) if fen else False,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error testing chesscog: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/cache-info', methods=['GET'])
def get_cache_info():
    """Get information about cached files."""
    try:
        cache_dirs = []
        if os.path.exists(CACHE_FOLDER):
            for item in os.listdir(CACHE_FOLDER):
                item_path = os.path.join(CACHE_FOLDER, item)
                if os.path.isdir(item_path):
                    cache_info_path = os.path.join(item_path, 'cache_info.json')
                    if os.path.exists(cache_info_path):
                        with open(cache_info_path, 'r') as f:
                            cache_info = json.load(f)
                        cache_dirs.append({
                            'hash': item,
                            'pages': cache_info.get('total_pages', 0),
                            'created': cache_info.get('created_at', 'unknown')
                        })
        
        return jsonify({
            'cache_folder': CACHE_FOLDER,
            'cached_files': cache_dirs,
            'total_cached': len(cache_dirs)
        })
        
    except Exception as e:
        logger.error(f"Error getting cache info: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Chess Vision Service...")
    print(f"Chesscog available: {CHESSCOG_AVAILABLE}")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Cache folder: {CACHE_FOLDER}")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
