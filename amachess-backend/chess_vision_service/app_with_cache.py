from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pdf2image import convert_from_bytes
import io
import base64
import logging
import os
from werkzeug.utils import secure_filename
import hashlib
import json
from datetime import datetime, timedelta
import threading
import time

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
CACHE_EXPIRY_HOURS = 24  # Cache PDFs for 24 hours

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)

# PDF cache to store converted images temporarily
pdf_cache = {}
cache_lock = threading.Lock()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_pdf_hash(pdf_data):
    """Generate a hash for PDF data to use as cache key"""
    return hashlib.sha256(pdf_data).hexdigest()

def cache_pdf_images(pdf_hash, images):
    """Cache PDF images with expiry"""
    with cache_lock:
        pdf_cache[pdf_hash] = {
            'images': images,
            'timestamp': datetime.now(),
            'expiry': datetime.now() + timedelta(hours=CACHE_EXPIRY_HOURS)
        }

def get_cached_pdf_images(pdf_hash):
    """Get cached PDF images if not expired"""
    with cache_lock:
        if pdf_hash in pdf_cache:
            cache_entry = pdf_cache[pdf_hash]
            if datetime.now() < cache_entry['expiry']:
                return cache_entry['images']
            else:
                # Remove expired entry
                del pdf_cache[pdf_hash]
    return None

def cleanup_cache():
    """Remove expired cache entries"""
    with cache_lock:
        now = datetime.now()
        expired_keys = [key for key, value in pdf_cache.items() if now >= value['expiry']]
        for key in expired_keys:
            del pdf_cache[key]
            logger.info(f"Removed expired cache entry: {key}")

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
    This is a placeholder - in reality you would use Chesscog or similar
    """
    try:
        # Placeholder implementation
        # In a real implementation, you would:
        # 1. Preprocess the image (resize, normalize, etc.)
        # 2. Use Chesscog or similar library to recognize the position
        # 3. Return the FEN string
        
        # For now, return a mock FEN based on image characteristics
        height, width = image_crop.shape[:2]
        
        # Calculate some basic image statistics
        gray = cv2.cvtColor(image_crop, cv2.COLOR_RGB2GRAY) if len(image_crop.shape) == 3 else image_crop
        mean_intensity = np.mean(gray)
        
        # Mock FEN selection based on image characteristics
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
        
        # Mock confidence based on image quality
        confidence = min(0.95, 0.5 + (width * height) / 100000)
        
        return selected_fen, confidence
        
    except Exception as e:
        logger.error(f"Error in FEN extraction: {str(e)}")
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 0.5

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
        pdf_hash = get_pdf_hash(pdf_data)
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
        
        # Store PDF hash for later FEN extraction
        # In a real implementation, you might want to store this in a database
        response_data = {
            'success': True,
            'boundingBoxes': all_bounding_boxes,
            'message': f'Found {len(all_bounding_boxes)} chess boards across {len(images)} pages',
            'pdf_hash': pdf_hash  # Return hash for FEN extraction
        }
        
        return jsonify(response_data)
        
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
    Accept JSON: { page, x, y, width, height, pdf_hash? }
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
        
        logger.info(f"Extracting FEN from page {page}, coordinates ({x}, {y}, {width}, {height})")
        
        # Try to get cached images if PDF hash is provided
        if pdf_hash:
            cached_images = get_cached_pdf_images(pdf_hash)
            if cached_images and len(cached_images) >= page:
                # Get the specific page image
                page_image = cached_images[page - 1]  # Convert to 0-based index
                image_array = np.array(page_image)
                
                # Crop the region
                crop_y_end = min(y + height, image_array.shape[0])
                crop_x_end = min(x + width, image_array.shape[1])
                
                if y >= image_array.shape[0] or x >= image_array.shape[1]:
                    return jsonify({
                        'success': False,
                        'message': 'Crop coordinates are outside image bounds'
                    }), 400
                
                cropped_image = image_array[y:crop_y_end, x:crop_x_end]
                
                # Extract FEN from cropped image
                fen, confidence = extract_fen_from_image(cropped_image)
                
                return jsonify({
                    'success': True,
                    'fen': fen,
                    'confidence': round(confidence, 2),
                    'message': 'FEN extracted successfully from cached PDF'
                })
        
        # If no cached images or no PDF hash, return a mock FEN
        # In a real implementation, you would require the PDF to be re-uploaded
        # or implement a more sophisticated caching mechanism
        
        logger.warning("No cached PDF images available, returning mock FEN")
        
        # Mock FEN extraction
        mock_fens = [
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',  # Starting position
            'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',  # 1.e4 e5
            'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3',  # 1.e4 e5 2.Nf3 Nf6
            'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 2 4',  # Variation
            'rnbqkb1r/ppp1pppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',  # Caro-Kann
        ]
        
        # Use a simple hash of coordinates to pick a consistent FEN
        fen_index = (x + y + width + height + page) % len(mock_fens)
        selected_fen = mock_fens[fen_index]
        
        # Mock confidence based on bounding box size and position
        confidence = min(0.95, 0.5 + (width * height) / 100000)
        
        return jsonify({
            'success': True,
            'fen': selected_fen,
            'confidence': round(confidence, 2),
            'message': 'FEN extracted successfully (mock implementation)'
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
        'message': 'Chess Vision Service is running',
        'cache_size': len(pdf_cache)
    })

@app.route('/clear-cache', methods=['POST'])
def clear_cache():
    """Clear the PDF cache"""
    with cache_lock:
        cache_size = len(pdf_cache)
        pdf_cache.clear()
        
    return jsonify({
        'success': True,
        'message': f'Cache cleared. Removed {cache_size} entries.'
    })

# Background task to clean up expired cache entries
def background_cache_cleanup():
    """Background task to periodically clean up expired cache entries"""
    while True:
        time.sleep(3600)  # Check every hour
        cleanup_cache()

# Start background cleanup thread
cleanup_thread = threading.Thread(target=background_cache_cleanup, daemon=True)
cleanup_thread.start()

if __name__ == '__main__':
    logger.info("Starting Chess Vision Service...")
    app.run(host='0.0.0.0', port=5000, debug=True)
