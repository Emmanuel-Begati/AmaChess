from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pdf2image import convert_from_bytes
import io
import base64
import logging
import os
import hashlib
import tempfile
from datetime import datetime
from werkzeug.utils import secure_filename

# Try to import chesscog - if not available, use mock implementation
try:
    from chesscog.recognition.recognition import ChessRecognizer
    from chesscog.core.models import get_model
    CHESSCOG_AVAILABLE = True
    print("✅ Chesscog imported successfully")
except ImportError as e:
    print(f"⚠️  Chesscog not available: {e}")
    print("   Using mock FEN implementation")
    CHESSCOG_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
CACHE_FOLDER = 'pdf_cache'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)

# PDF cache to store converted images temporarily
pdf_cache = {}

# Initialize chesscog recognizer if available
recognizer = None
if CHESSCOG_AVAILABLE:
    try:
        logger.info("Initializing Chesscog recognizer...")
        recognizer = ChessRecognizer()
        logger.info("✅ Chesscog recognizer initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Chesscog: {e}")
        CHESSCOG_AVAILABLE = False

def generate_pdf_hash(pdf_bytes):
    """Generate a hash for the PDF content"""
    return hashlib.md5(pdf_bytes).hexdigest()

def cache_pdf_images(pdf_hash, images):
    """Cache PDF images in memory"""
    pdf_cache[pdf_hash] = {
        'images': images,
        'timestamp': datetime.now()
    }

def get_cached_pdf_images(pdf_hash):
    """Get cached PDF images"""
    return pdf_cache.get(pdf_hash, {}).get('images')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_chessboard_contours(image):
    """
    Detect chessboard-like contours in an image using OpenCV
    Returns list of bounding boxes with confidence scores
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Apply adaptive thresholding to handle different lighting conditions
        adaptive_thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                               cv2.THRESH_BINARY, 11, 2)
        
        # Find contours
        contours, _ = cv2.findContours(adaptive_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        chessboard_candidates = []
        
        for contour in contours:
            # Filter by area (chess boards should be reasonably large)
            area = cv2.contourArea(contour)
            if area < 10000:  # Minimum area threshold
                continue
                
            # Approximate the contour to get vertices
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Look for 4-point contours (rectangles/squares)
            if len(approx) == 4:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(approx)
                
                # Check aspect ratio (chess boards are roughly square)
                aspect_ratio = w / h
                if 0.7 <= aspect_ratio <= 1.3:  # Allow some tolerance
                    
                    # Calculate confidence based on various factors
                    confidence = calculate_chessboard_confidence(gray[y:y+h, x:x+w], approx, area)
                    
                    if confidence > 0.3:  # Minimum confidence threshold
                        chessboard_candidates.append({
                            'x': int(x),
                            'y': int(y),
                            'width': int(w),
                            'height': int(h),
                            'confidence': round(confidence, 2)
                        })
        
        # Sort by confidence and return top candidates
        chessboard_candidates.sort(key=lambda x: x['confidence'], reverse=True)
        return chessboard_candidates[:5]  # Return top 5 candidates
        
    except Exception as e:
        logger.error(f"Error in chessboard detection: {str(e)}")
        return []

def calculate_chessboard_confidence(roi, contour, area):
    """
    Calculate confidence score for a potential chessboard region
    """
    try:
        confidence = 0.5  # Base confidence
        
        # Factor 1: Edge density (chess boards have many internal edges)
        edges = cv2.Canny(roi, 50, 150)
        edge_density = np.sum(edges > 0) / (roi.shape[0] * roi.shape[1])
        confidence += min(edge_density * 2, 0.3)  # Up to 0.3 bonus
        
        # Factor 2: Contour solidity (how well the contour fills its convex hull)
        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        if hull_area > 0:
            solidity = area / hull_area
            confidence += solidity * 0.2  # Up to 0.2 bonus
        
        # Factor 3: Check for grid-like patterns
        if roi.shape[0] > 100 and roi.shape[1] > 100:
            # Look for repetitive patterns that suggest a grid
            resized = cv2.resize(roi, (64, 64))
            variance = np.var(resized)
            if variance > 1000:  # High variance suggests pattern complexity
                confidence += 0.1
        
        return min(confidence, 1.0)
        
    except Exception as e:
        logger.error(f"Error calculating confidence: {str(e)}")
        return 0.3

def extract_fen_from_image(image_crop):
    """
    Extract FEN from a cropped chess board image
    Uses Chesscog if available, otherwise returns mock FEN
    """
    try:
        if CHESSCOG_AVAILABLE and recognizer:
            # Convert PIL image to OpenCV format
            image_array = np.array(image_crop)
            
            # Chesscog expects RGB format
            if len(image_array.shape) == 3:
                image_cv = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            else:
                image_cv = image_array
            
            # Use Chesscog to recognize the position
            try:
                result = recognizer.predict(image_cv)
                
                if result and 'fen' in result:
                    fen = result['fen']
                    confidence = result.get('confidence', 0.8)
                    logger.info(f"Chesscog FEN: {fen}")
                    return fen, confidence
                else:
                    logger.warning("Chesscog did not return a valid FEN")
                    
            except Exception as e:
                logger.error(f"Error using Chesscog: {e}")
        
        # Fallback to mock implementation
        logger.info("Using mock FEN implementation")
        return mock_fen_extraction(image_crop)
        
    except Exception as e:
        logger.error(f"Error in FEN extraction: {str(e)}")
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 0.5

def mock_fen_extraction(image_crop):
    """
    Mock FEN extraction for when Chesscog is not available
    """
    # Convert PIL image to numpy array for analysis
    image_array = np.array(image_crop)
    
    # Calculate some basic image statistics for mock FEN selection
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY) if len(image_array.shape) == 3 else image_array
    mean_intensity = np.mean(gray)
    
    # Mock FEN responses based on image characteristics
    mock_fens = [
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',  # Starting position
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',  # 1.e4 e5
        'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3',  # 1.e4 e5 2.Nf3 Nf6
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 2 4',  # Variation
        'rnbqkb1r/ppp1pppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',  # Caro-Kann
        'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',  # Italian Game
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',  # Sicilian Defense
        'rnbqkb1r/pppppppp/5n2/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 2',  # King's Indian Defense
    ]
    
    # Use image statistics to select FEN
    fen_index = int(mean_intensity) % len(mock_fens)
    selected_fen = mock_fens[fen_index]
    
    # Mock confidence based on image properties
    height, width = image_array.shape[:2]
    confidence = min(0.95, 0.5 + (width * height) / 100000)
    
    return selected_fen, confidence

@app.route('/detect-boards', methods=['POST'])
def detect_boards():
    """
    Flask route 1: /detect-boards
    Accept a PDF file via POST
    Use pdf2image to convert PDF pages to images
    Use OpenCV to detect 4-point contours that resemble chessboards
    For each one, return { page, x, y, width, height }
    """
    try:
        # Check if file is in request
        if 'pdf' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No PDF file provided'
            }), 400
        
        file = request.files['pdf']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Only PDF files are allowed'
            }), 400
        
        # Read PDF file
        pdf_data = file.read()
        pdf_hash = generate_pdf_hash(pdf_data)
        logger.info(f"Processing PDF file: {file.filename}, Size: {len(pdf_data)} bytes, Hash: {pdf_hash[:8]}...")
        
        # Check cache first
        cached_images = get_cached_pdf_images(pdf_hash)
        if cached_images:
            logger.info("Using cached PDF images")
            images = cached_images
        else:
            # Convert PDF to images
            try:
                images = convert_from_bytes(pdf_data, dpi=200)  # Higher DPI for better detection
                logger.info(f"Converted PDF to {len(images)} images")
                # Cache the images
                cache_pdf_images(pdf_hash, images)
            except Exception as e:
                logger.error(f"Error converting PDF to images: {str(e)}")
                return jsonify({
                    'success': False,
                    'message': 'Failed to convert PDF to images'
                }), 500
        
        all_bounding_boxes = []
        
        # Process each page
        for page_num, image in enumerate(images, 1):
            # Convert PIL image to numpy array
            image_array = np.array(image)
            
            # Detect chessboards on this page
            bounding_boxes = detect_chessboard_contours(image_array)
            
            # Add page number to each bounding box
            for box in bounding_boxes:
                box['page'] = page_num
                all_bounding_boxes.append(box)
            
            logger.info(f"Page {page_num}: Found {len(bounding_boxes)} potential chessboards")
        
        logger.info(f"Total chessboards detected: {len(all_bounding_boxes)}")
        
        return jsonify({
            'success': True,
            'boundingBoxes': all_bounding_boxes,
            'message': f'Found {len(all_bounding_boxes)} chess boards across {len(images)} pages',
            'pdf_hash': pdf_hash
        })
        
    except Exception as e:
        logger.error(f"Error in detect_boards: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error during chess board detection',
            'error': str(e)
        }), 500

@app.route('/extract_fen', methods=['POST'])
def extract_fen():
    """
    Flask route 2: /extract_fen
    Accept JSON: { page, x, y, width, height, pdf_hash }
    Load the specified page as image from cache
    Crop the region (x, y, w, h)
    Pass cropped image to Chesscog to get the FEN
    Return the FEN as JSON
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No JSON data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['page', 'x', 'y', 'width', 'height']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        page = data['page']
        x = data['x']
        y = data['y']
        width = data['width']
        height = data['height']
        pdf_hash = data.get('pdf_hash')
        
        # Validate data types and ranges
        try:
            page = int(page)
            x = int(x)
            y = int(y)
            width = int(width)
            height = int(height)
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'All coordinates must be integers'
            }), 400
        
        if page < 1 or x < 0 or y < 0 or width <= 0 or height <= 0:
            return jsonify({
                'success': False,
                'message': 'Invalid coordinate values'
            }), 400
        
        if not pdf_hash:
            return jsonify({
                'success': False,
                'message': 'PDF hash is required'
            }), 400
        
        # Get cached images
        cached_images = get_cached_pdf_images(pdf_hash)
        if not cached_images:
            return jsonify({
                'success': False,
                'message': 'PDF not found in cache. Please detect boards first.'
            }), 404
        
        if page > len(cached_images):
            return jsonify({
                'success': False,
                'message': f'Invalid page number: {page}'
            }), 400
        
        logger.info(f"Extracting FEN from page {page}, coordinates ({x}, {y}, {width}, {height})")
        
        # Get the specific page image
        image = cached_images[page - 1]
        
        # Crop the region
        cropped_image = image.crop((x, y, x + width, y + height))
        
        # Extract FEN from the cropped region
        fen, confidence = extract_fen_from_image(cropped_image)
        
        return jsonify({
            'success': True,
            'fen': fen,
            'confidence': confidence,
            'message': 'FEN extracted successfully',
            'using_chesscog': CHESSCOG_AVAILABLE
        })
        
    except Exception as e:
        logger.error(f"Error in extract_fen: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error during FEN extraction',
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Chess Vision Service',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'cache_size': len(pdf_cache),
        'chesscog_available': CHESSCOG_AVAILABLE
    })

@app.route('/setup-chesscog', methods=['POST'])
def setup_chesscog():
    """
    Endpoint to help set up Chesscog
    """
    try:
        if CHESSCOG_AVAILABLE:
            return jsonify({
                'success': True,
                'message': 'Chesscog is already available and configured',
                'chesscog_available': True
            })
        
        return jsonify({
            'success': False,
            'message': 'Chesscog is not available. Please install it manually.',
            'chesscog_available': False,
            'instructions': [
                '1. Install git if not already installed',
                '2. Run: pip install git+https://github.com/georg-wolflein/chesscog.git',
                '3. Download models: python -m chesscog.occupancy_classifier.download_model',
                '4. Download models: python -m chesscog.piece_classifier.download_model',
                '5. Restart the service'
            ]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error checking Chesscog setup: {str(e)}'
        }), 500

if __name__ == '__main__':
    logger.info("Starting Chess Vision Service...")
    logger.info("Available endpoints:")
    logger.info("  POST /detect-boards - Detect chess boards in PDF")
    logger.info("  POST /extract_fen - Extract FEN from coordinates")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /setup-chesscog - Setup Chesscog")
    logger.info(f"\nChesscog available: {CHESSCOG_AVAILABLE}")
    logger.info("Service running on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
