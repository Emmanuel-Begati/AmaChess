"""
Mock chesscog implementation for testing purposes.
This provides a simplified chess position recognition system.
"""

import cv2
import numpy as np
import chess
import chess.pgn
from typing import Optional, List, Tuple, Dict
import random

class MockChessboardDetector:
    """Mock implementation of chessboard detection"""
    
    def __init__(self):
        self.board_size = 8
        
    def detect_chessboard(self, image: np.ndarray) -> Optional[str]:
        """
        Mock FEN detection from image.
        Returns a random valid chess position for testing.
        """
        # List of sample valid chess positions
        sample_positions = [
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",  # Starting position
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",  # After e4
            "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",  # After Nf6
            "rnbqkb1r/pppp1ppp/4pn2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",  # After e6
            "rnbqkb1r/pppp1ppp/4pn2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 3",  # After Nf3
            "r1bqkb1r/pppp1ppp/2n1pn2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 4",  # After Nc6
            "r1bqkb1r/pppp1ppp/2n1pn2/8/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 4",  # After Bc4
            "r1bqk2r/pppp1ppp/2n1pn2/2b5/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5",  # After Bc5
        ]
        
        # Return a random valid position
        return random.choice(sample_positions)
        
    def analyze_board_image(self, image: np.ndarray) -> Dict:
        """
        Analyze the board image and return detailed information.
        """
        try:
            # Get image dimensions
            height, width = image.shape[:2]
            
            # Mock analysis
            analysis = {
                'fen': self.detect_chessboard(image),
                'confidence': random.uniform(0.7, 0.95),
                'board_found': True,
                'image_size': (width, height),
                'pieces_detected': random.randint(16, 32),
                'analysis_time': random.uniform(0.1, 0.5)
            }
            
            return analysis
            
        except Exception as e:
            return {
                'fen': None,
                'confidence': 0.0,
                'board_found': False,
                'error': str(e),
                'image_size': image.shape[:2] if image is not None else None
            }

def predict_fen(image: np.ndarray) -> str:
    """
    Main function to predict FEN from image.
    This is the interface that mimics the real chesscog library.
    """
    detector = MockChessboardDetector()
    return detector.detect_chessboard(image)

def get_board_classification(image: np.ndarray) -> Dict:
    """
    Get detailed board classification.
    """
    detector = MockChessboardDetector()
    return detector.analyze_board_image(image)

# Additional utility functions
def is_valid_fen(fen: str) -> bool:
    """Check if a FEN string is valid."""
    try:
        chess.Board(fen)
        return True
    except:
        return False

def fen_to_board_description(fen: str) -> str:
    """Convert FEN to human-readable board description."""
    try:
        board = chess.Board(fen)
        return f"Board: {board.fen()}\nTurn: {'White' if board.turn else 'Black'}\nCastling: {board.castling_rights}\nEn passant: {board.ep_square}"
    except:
        return "Invalid FEN"

if __name__ == "__main__":
    # Test the mock implementation
    print("Testing mock chesscog implementation...")
    
    # Create a dummy image
    test_image = np.zeros((400, 400, 3), dtype=np.uint8)
    
    # Test FEN prediction
    fen = predict_fen(test_image)
    print(f"Predicted FEN: {fen}")
    print(f"FEN is valid: {is_valid_fen(fen)}")
    
    # Test board analysis
    analysis = get_board_classification(test_image)
    print(f"Board analysis: {analysis}")
    
    # Test board description
    description = fen_to_board_description(fen)
    print(f"Board description: {description}")
