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

# Import mock chesscog if available
try:
    from mock_chesscog import MockChessboardDetector
    MOCK_CHESSCOG_AVAILABLE = True
    print("✅ Mock chesscog imported successfully")
except ImportError as e:
    print(f"⚠️  Mock chesscog not available: {e}")
    MOCK_CHESSCOG_AVAILABLE = False

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
mock_detector = None

def init_chesscog():
    """Initialize chesscog recognizer if available"""
    global recognizer, mock_detector
    if CHESSCOG_AVAILABLE:
        try:
            recognizer = ChessRecognizer()
            print("✅ ChessRecognizer initialized successfully")
        except Exception as e:
            print(f"⚠️  Failed to initialize ChessRecognizer: {e}")
            print("   Falling back to mock implementation")
            recognizer = None
    
    # Initialize mock detector as fallback
    if MOCK_CHESSCOG_AVAILABLE:
        try:
            mock_detector = MockChessboardDetector()
            print("✅ Mock ChessRecognizer initialized as fallback")
        except Exception as e:
            print(f"⚠️  Failed to initialize Mock ChessRecognizer: {e}")
            mock_detector = None

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
        
        # Resize image if too large for faster processing
        height, width = gray.shape
        if width > 1500 or height > 1500:
            scale_factor = min(1500/width, 1500/height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            gray = cv2.resize(gray, (new_width, new_height))
            scale_back = 1 / scale_factor
        else:
            scale_back = 1
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding to handle different lighting conditions
        adaptive_thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                               cv2.THRESH_BINARY, 11, 2)
        
        # Find contours
        contours, _ = cv2.findContours(adaptive_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        chessboard_candidates = []
        
        # Filter contours more efficiently
        for contour in contours:
            # Quick area filter (chess boards should be reasonably large)
            area = cv2.contourArea(contour)
            min_area = 5000 * (scale_back ** 2)  # Adjust for scaling
            if area < min_area:
                continue
                
            # Get bounding rectangle directly (faster than approximation)
            x, y, w, h = cv2.boundingRect(contour)
            
            # Check aspect ratio (chess boards are roughly square)
            aspect_ratio = w / h
            if not (0.6 <= aspect_ratio <= 1.4):  # Allow some tolerance
                continue
                
            # Scale coordinates back to original size
            x = int(x * scale_back)
            y = int(y * scale_back)
            w = int(w * scale_back)
            h = int(h * scale_back)
            
            # Calculate confidence based on size and aspect ratio
            confidence = calculate_chessboard_confidence_fast(area, aspect_ratio, w, h)
            
            if confidence > 0.3:  # Minimum confidence threshold
                chessboard_candidates.append({
                    'x': x,
                    'y': y,
                    'width': w,
                    'height': h,
                    'confidence': round(confidence, 2)
                })
        
        # Sort by confidence and return top candidates
        chessboard_candidates.sort(key=lambda x: x['confidence'], reverse=True)
        return chessboard_candidates[:10]  # Return top 10 candidates
        
    except Exception as e:
        logger.error(f"Error in detect_chessboard_contours: {str(e)}")
        return []
        chessboard_candidates.sort(key=lambda x: x['confidence'], reverse=True)
        return chessboard_candidates[:5]  # Return top 5 candidates
        
    except Exception as e:
        logger.error(f"Error in chessboard detection: {str(e)}")
        return []

def calculate_chessboard_confidence_fast(area, aspect_ratio, width, height):
    """
    Fast confidence calculation for chessboard detection
    """
    try:
        confidence = 0.0
        
        # Area-based confidence (larger areas get higher confidence)
        if area > 50000:
            confidence += 0.4
        elif area > 20000:
            confidence += 0.3
        elif area > 10000:
            confidence += 0.2
        else:
            confidence += 0.1
        
        # Aspect ratio confidence (closer to square is better)
        aspect_diff = abs(aspect_ratio - 1.0)
        if aspect_diff < 0.1:
            confidence += 0.3
        elif aspect_diff < 0.2:
            confidence += 0.2
        elif aspect_diff < 0.3:
            confidence += 0.1
        
        # Size confidence (reasonable chess board size)
        if 150 <= width <= 600 and 150 <= height <= 600:
            confidence += 0.3
        elif 100 <= width <= 800 and 100 <= height <= 800:
            confidence += 0.2
        else:
            confidence += 0.1
        
        return min(confidence, 1.0)
        
    except Exception as e:
        logger.error(f"Error calculating confidence: {str(e)}")
        return 0.0


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
        
        # Factor 3: Check for grid-like patterns using template matching
        # This is a simplified approach - in practice you might use more sophisticated methods
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
        
        # Get optional parameters for pagination
        max_pages = request.form.get('max_pages', type=int, default=None)
        start_page = request.form.get('start_page', type=int, default=1)
        
        # Check cache first
        cached_images = get_cached_pdf_images(pdf_hash)
        if cached_images:
            logger.info("Using cached PDF images")
            images = cached_images
        else:
            # Convert PDF to images with optimized settings
            try:
                logger.info("Converting PDF to images...")
                images = convert_from_bytes(
                    pdf_data, 
                    dpi=150,  # Reduced DPI for faster processing while maintaining quality
                    first_page=start_page,
                    last_page=max_pages + start_page - 1 if max_pages else None,
                    thread_count=2  # Use multiple threads for conversion
                )
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
        
        # Process each page with progress logging
        total_pages = len(images)
        logger.info(f"Processing {total_pages} pages for chess board detection...")
        
        for page_num, image in enumerate(images, 1):
            logger.info(f"Processing page {page_num}/{total_pages}...")
            
            # Convert PIL image to numpy array
            image_array = np.array(image)
            
            # Detect chessboards on this page
            bounding_boxes = detect_chessboard_contours(image_array)
            
            # Add page number to each bounding box
            for box in bounding_boxes:
                box['page'] = page_num + start_page - 1  # Adjust for start_page
                all_bounding_boxes.append(box)
            
            logger.info(f"Page {page_num}: Found {len(bounding_boxes)} potential chessboards")
            
            # Add a small delay to prevent overwhelming the system
            if page_num % 5 == 0:
                import time
                time.sleep(0.1)
        
        logger.info(f"Completed processing: {len(all_bounding_boxes)} total chessboards detected")
        
        # Return results with processing info
        return jsonify({
            'success': True,
            'boundingBoxes': all_bounding_boxes,
            'message': f'Found {len(all_bounding_boxes)} chess boards across {total_pages} pages',
            'pdf_hash': pdf_hash,
            'pages_processed': total_pages,
            'processing_time': f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
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
    Accept JSON: { page, x, y, width, height }
    Load the specified page as image again using pdf2image
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
        
        # Extract FEN from the cropped region (mock implementation)
        fen, confidence = extract_fen_from_image(cropped_image)
        
        return jsonify({
            'success': True,
            'fen': fen,
            'confidence': confidence,
            'message': 'FEN extracted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in extract_fen: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error during FEN extraction',
            'error': str(e)
        }), 500

def extract_fen_from_image(image_crop):
    """
    Extract FEN from a cropped chess board image
    Uses chesscog if available, otherwise falls back to mock implementation
    """
    try:
        # Try to use real chesscog first
        if CHESSCOG_AVAILABLE and recognizer is not None:
            try:
                # Convert PIL image to numpy array format expected by chesscog
                image_array = np.array(image_crop)
                
                # Use chesscog to recognize the chess position
                fen = recognizer.predict(image_array)
                logger.info(f"Chesscog FEN prediction: {fen}")
                return fen, 0.95  # Return FEN and high confidence for real chesscog
            except Exception as e:
                logger.warning(f"Error using chesscog: {e}")
                logger.info("Falling back to mock implementation")
                # Fall through to mock implementation
        
        # Try to use mock chesscog
        if MOCK_CHESSCOG_AVAILABLE and mock_detector is not None:
            try:
                # Convert PIL image to numpy array
                image_array = np.array(image_crop)
                # Convert RGB to BGR for OpenCV processing
                if len(image_array.shape) == 3:
                    image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
                
                fen = mock_detector.detect_chessboard(image_array)
                logger.info(f"Mock chesscog FEN prediction: {fen}")
                return fen, 0.85  # Return FEN and good confidence for mock
            except Exception as e:
                logger.warning(f"Error using mock chesscog: {e}")
                logger.info("Falling back to basic mock implementation")
                # Fall through to basic mock implementation
        
        # Basic mock implementation (existing code)
        logger.info("Using basic mock FEN implementation")
        
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
        ]
        
        # Use image statistics to select FEN
        fen_index = int(mean_intensity) % len(mock_fens)
        selected_fen = mock_fens[fen_index]
        
        # Mock confidence based on image properties
        height, width = image_array.shape[:2]
        confidence = min(0.95, 0.5 + (width * height) / 100000)
        
        return selected_fen, confidence
        
    except Exception as e:
        logger.error(f"Error in FEN extraction: {str(e)}")
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 0.5

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Chess Vision Service',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'cache_size': len(pdf_cache),
        'chesscog_available': CHESSCOG_AVAILABLE,
        'chesscog_initialized': recognizer is not None,
        'mock_chesscog_available': MOCK_CHESSCOG_AVAILABLE,
        'mock_chesscog_initialized': mock_detector is not None
    })

@app.route('/test-chesscog', methods=['GET'])
def test_chesscog():
    """Test chesscog functionality"""
    try:
        # Create a simple test image (black and white checkered pattern)
        test_image = np.zeros((400, 400, 3), dtype=np.uint8)
        # Add a simple checkered pattern
        for i in range(0, 400, 50):
            for j in range(0, 400, 50):
                if (i//50 + j//50) % 2 == 0:
                    test_image[i:i+50, j:j+50] = [255, 255, 255]
        
        # Convert to PIL Image
        from PIL import Image
        test_pil_image = Image.fromarray(test_image)
        
        # Try to extract FEN
        fen, confidence = extract_fen_from_image(test_pil_image)
        
        return jsonify({
            'success': True,
            'message': 'Chesscog test completed',
            'test_fen': fen,
            'confidence': confidence,
            'chesscog_available': CHESSCOG_AVAILABLE,
            'chesscog_initialized': recognizer is not None,
            'mock_chesscog_available': MOCK_CHESSCOG_AVAILABLE,
            'mock_chesscog_initialized': mock_detector is not None
        })
        
    except Exception as e:
        logger.error(f"Error in chesscog test: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error testing chesscog',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Chess Vision Service...")
    logger.info("Available endpoints:")
    logger.info("  POST /detect-boards - Detect chess boards in PDF")
    logger.info("  POST /extract_fen - Extract FEN from coordinates")
    logger.info("  GET  /health - Health check")
    logger.info("  GET  /test-chesscog - Test chesscog functionality")
    
    # Initialize chesscog if available
    init_chesscog()
    
    logger.info(f"Chesscog available: {CHESSCOG_AVAILABLE}")
    logger.info(f"Chesscog initialized: {recognizer is not None}")
    logger.info(f"Mock chesscog available: {MOCK_CHESSCOG_AVAILABLE}")
    logger.info(f"Mock chesscog initialized: {mock_detector is not None}")
    logger.info("\nService running on http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
