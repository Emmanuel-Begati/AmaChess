import re
import chess
import chess.pgn
from typing import List, Optional, Tuple, Dict, Any
from io import StringIO, BytesIO
from models import ChessBook, Chapter, Page, Exercise, PracticePosition, BookMetadata, MoveAnnotation, PositionDiagram
import json
import logging
import base64
import os
from datetime import datetime
import uuid
import tempfile
import shutil

# Try to import optional dependencies
try:
    import PyPDF2
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

# Image processing dependencies
try:
    import cv2
    import numpy as np
    from pdf2image import convert_from_bytes, convert_from_path
    import pytesseract
    HAS_IMAGE_PROCESSING = True
except ImportError:
    HAS_IMAGE_PROCESSING = False

logger = logging.getLogger(__name__)

class ChessBookParser:
    def __init__(self):
        # Enhanced FEN pattern for better validation
        self.fen_pattern = r'\b[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\/[rnbqkpRNBQKP1-8]+\s+[bw]\s+[KQkq-]+\s+[a-h1-8-]+\s+\d+\s+\d+\b'
        
        # Enhanced move pattern for better chess notation detection
        self.move_pattern = r'\b(?:\d+\.{1,3}\s*)?([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?|O-O(?:-O)?)[!?]{0,2}\b'
        
        # More flexible chapter patterns - ordered by specificity
        self.chapter_patterns = [
            r'^##\s*Chapter\s*(\d+)[:\s.-]*(.+?)(?=\n|$)',  # Markdown headers with Chapter
            r'^##\s*(.+?)(?=\n|$)',  # Generic markdown headers
            r'(?:Chapter|CHAPTER)\s*(\d+)[:\s.-]*(.+?)(?=\n|$)',  # Regular Chapter headers
            r'(?:Ch|CH)\.\s*(\d+)[:\s.-]*(.+?)(?=\n|$)',  # Abbreviated chapter headers
            r'(?:Part|PART)\s*(\d+)[:\s.-]*(.+?)(?=\n|$)'  # Part headers
        ]
        
        # Enhanced exercise patterns
        self.exercise_patterns = [
            r'(?:Exercise|EXERCISE)\s*(\d+)[:\s.-]*(.+?)(?=\n|Exercise|EXERCISE|$)',
            r'(?:Problem|PROBLEM)\s*(\d+)[:\s.-]*(.+?)(?=\n|Problem|PROBLEM|$)',
            r'(?:Puzzle|PUZZLE)\s*(\d+)[:\s.-]*(.+?)(?=\n|Puzzle|PUZZLE|$)',
            r'(?:Question|QUESTION)\s*(\d+)[:\s.-]*(.+?)(?=\n|Question|QUESTION|$)',
            r'\*\*Exercise\s*(\d+)\*\*[:\s.-]*(.+?)(?=\n\*\*|$)',
            r'\*\*Problem\s*(\d+)\*\*[:\s.-]*(.+?)(?=\n\*\*|$)',
            r'\*\*Question\s*(\d+)\*\*[:\s.-]*(.+?)(?=\n\*\*|$)'
        ]
        
        # Position indicator patterns
        self.position_indicators = [
            r'(?:Position|POSITION)[:\s.-]*',
            r'(?:Diagram|DIAGRAM)[:\s.-]*',
            r'(?:After|AFTER)[:\s.-]*',
            r'(?:White to move|Black to move|White to play|Black to play)',
            r'(?:FEN|fen)[:\s.-]*'
        ]
        
        # Solution patterns
        self.solution_patterns = [
            r'\*\*Solution\*\*:\s*([^\n*]+)',
            r'(?:Solution|SOLUTION)[:\s.-]*([^\n*]+)',
            r'\*\*Answer\*\*:\s*([^\n*]+)',
            r'(?:Answer|ANSWER)[:\s.-]*([^\n*]+)',
            r'(?:Best move|BEST MOVE)[:\s.-]*([^\n*]+)',
            r'(?:Correct|CORRECT)[:\s.-]*([^\n*]+)',
            r'(?:Solution|Answer)\s*:\s*([^\n*]+)',
            r'(?:Solution|Answer)\s+([^\n*]+)'
        ]
        
        # Explanation patterns
        self.explanation_patterns = [
            r'\*\*Explanation\*\*:\s*([^\n*]+)',
            r'(?:Explanation|EXPLANATION)[:\s.-]*([^\n*]+)',
            r'(?:Because|BECAUSE)[:\s.-]*([^\n*]+)',
            r'(?:Analysis|ANALYSIS)[:\s.-]*([^\n*]+)',
            r'(?:Comment|COMMENT)[:\s.-]*([^\n*]+)'
        ]
        
    def parse_book(self, file_content, filename: str, title: str, author: str) -> ChessBook:
        """Main parsing method that handles different file formats"""
        try:
            # Detect file format and extract text
            if filename.endswith('.pdf'):
                text_content = self._extract_text_from_pdf_content(file_content)
                # Extract images and chess positions from PDF
                chess_positions_from_images = self._extract_images_from_pdf(file_content)
            elif filename.endswith('.docx'):
                text_content = self._extract_text_from_docx_content(file_content)
                chess_positions_from_images = []  # No image processing for DOCX yet
            elif filename.endswith('.pgn'):
                text_content = self._parse_pgn_content(file_content)
                chess_positions_from_images = []  # No image processing for PGN
            else:
                # Handle string content (txt, md files)
                if isinstance(file_content, bytes):
                    try:
                        text_content = file_content.decode('utf-8')
                    except UnicodeDecodeError:
                        text_content = file_content.decode('utf-8', errors='replace')
                else:
                    text_content = file_content
                chess_positions_from_images = []
                
            # Parse the content
            chapters = self._parse_chapters(text_content)
            positions = self._extract_positions(text_content)
            
            # Enrich with positions from images
            for pos in chess_positions_from_images:
                if pos['fen']:
                    positions.append(pos['fen'])
                
            practice_positions = self._extract_practice_positions(text_content, chapters)
            
            # Add positions from images to appropriate chapters/pages
            self._integrate_image_positions(chapters, chess_positions_from_images)
            
            # Create metadata
            metadata = BookMetadata(
                totalPages=len([page for chapter in chapters for page in chapter.pages]),
                totalChapters=len(chapters),
                difficulty=self._determine_overall_difficulty(text_content),
                topics=self._extract_topics(text_content),
                format="pgn_enhanced" if filename.endswith('.pgn') else "text_enhanced",
                parsing_date=datetime.utcnow()
            )
            
            book = ChessBook(
                id=str(uuid.uuid4()),
                title=title,
                author=author,
                totalPositions=len(positions),
                chapters=chapters,
                practicePositions=practice_positions,
                metadata=metadata
            )
            
            logger.info(f"Successfully parsed book: {title} by {author}")
            logger.info(f"Found {len(chapters)} chapters, {len(positions)} positions, {len(practice_positions)} practice positions")
            
            return book
            
        except Exception as e:
            logger.error(f"Error parsing book: {str(e)}")
            raise Exception(f"Failed to parse book: {str(e)}")
    
    def _parse_pgn_content(self, content) -> str:
        """Parse PGN content and extract text with moves"""
        try:
            if isinstance(content, bytes):
                pgn_text = content.decode('utf-8', errors='replace')
            else:
                pgn_text = str(content)
                
            # Create a StringIO object for chess.pgn to read
            pgn_io = StringIO(pgn_text)
            
            # Parse PGN games
            parsed_text = []
            game_count = 0
            
            while True:
                game = chess.pgn.read_game(pgn_io)
                if game is None:
                    break
                    
                game_count += 1
                
                # Extract game headers
                headers = []
                for key, value in game.headers.items():
                    headers.append(f"{key}: {value}")
                
                parsed_text.append(f"## Game {game_count}")
                parsed_text.append("\n".join(headers))
                
                # Extract moves with annotations
                board = chess.Board()
                main_line = list(game.mainline())
                
                moves_text = []
                current_node = game
                
                while current_node.variations:
                    next_node = current_node.variations[0]
                    move = next_node.move
                    
                    # Get move number text
                    if board.turn == chess.WHITE:
                        move_number = f"{board.fullmove_number}."
                    else:
                        move_number = f"{board.fullmove_number}..."
                    
                    # Get SAN representation
                    san_move = board.san(move)
                    
                    # Check for comments/annotations
                    comment = next_node.comment.strip() if next_node.comment else ""
                    nag_annotations = ""
                    
                    # Process NAGs (Numeric Annotation Glyphs)
                    for nag in next_node.nags:
                        symbol = chess.pgn.NAG_SYMBOLS.get(nag, f"${nag}")
                        nag_annotations += symbol
                    
                    # Format move text
                    move_text = f"{move_number} {san_move}{nag_annotations}"
                    if comment:
                        move_text += f" {{{comment}}}"
                    
                    moves_text.append(move_text)
                    
                    # Make the move on the board
                    board.push(move)
                    current_node = next_node
                
                # Add moves text
                parsed_text.append(" ".join(moves_text))
                
                # Add a separator between games
                parsed_text.append("\n---\n")
            
            return "\n".join(parsed_text)
            
        except Exception as e:
            logger.error(f"Error parsing PGN content: {e}")
            if isinstance(content, bytes):
                return content.decode('utf-8', errors='replace')
            return str(content)
    
    def _extract_topics(self, content: str) -> List[str]:
        """Extract topics from book content based on keywords"""
        topics = []
        content_lower = content.lower()
        
        # Define topic keywords
        topic_keywords = {
            'openings': ['opening', 'debut', 'sicilian', 'french', 'caro-kann', 'queens gambit', 'ruy lopez', 'italian', 'english'],
            'tactics': ['tactic', 'combination', 'pin', 'fork', 'skewer', 'discovered', 'double attack', 'puzzle'],
            'endgames': ['endgame', 'ending', 'king and pawn', 'rook ending', 'queen ending', 'bishop ending', 'knight ending'],
            'strategy': ['strategy', 'plan', 'structure', 'weakness', 'advantage', 'positional', 'pawn structure'],
            'middlegame': ['middlegame', 'middle game', 'attack', 'defense', 'initiative'],
            'exercises': ['exercise', 'problem', 'puzzle', 'question', 'practice'],
            'theory': ['theory', 'principle', 'concept', 'fundamental', 'basic'],
            'analysis': ['analysis', 'variation', 'line', 'annotation', 'commentary'],
            'tournament': ['tournament', 'game', 'match', 'championship', 'competition'],
            'history': ['history', 'historical', 'classic', 'famous', 'legendary']
        }
        
        # Count occurrences of each topic
        topic_scores = {}
        for topic, keywords in topic_keywords.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            if score > 0:
                topic_scores[topic] = score
        
        # Sort topics by frequency and return top ones
        sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
        topics = [topic for topic, score in sorted_topics[:5]]  # Top 5 topics
        
        # Always include at least one topic
        if not topics:
            topics = ['general']
        
        return topics
    
    def _determine_overall_difficulty(self, content: str) -> str:
        """Determine overall difficulty of the book"""
        content_lower = content.lower()
        
        beginner_keywords = ['beginner', 'basic', 'introduction', 'learn', 'start']
        advanced_keywords = ['advanced', 'master', 'expert', 'complex', 'deep']
        
        beginner_count = sum(content_lower.count(word) for word in beginner_keywords)
        advanced_count = sum(content_lower.count(word) for word in advanced_keywords)
        
        if beginner_count > advanced_count * 1.5:
            return "beginner"
        elif advanced_count > beginner_count * 1.5:
            return "advanced"
        else:
            return "intermediate"
    
    def _extract_text_from_pdf_content(self, content) -> str:
        """Extract text from PDF content"""
        try:
            if not HAS_PDF:
                logger.warning("PyPDF2 not available, treating as plain text")
                if isinstance(content, bytes):
                    return content.decode('utf-8', errors='replace')
                return str(content)
            
            if isinstance(content, bytes):
                pdf_file = BytesIO(content)
                reader = PyPDF2.PdfReader(pdf_file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
            else:
                # If content is a file path
                reader = PyPDF2.PdfReader(content)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            if isinstance(content, bytes):
                return content.decode('utf-8', errors='replace')
            return str(content)
    
    def _extract_images_from_pdf(self, pdf_content) -> List[Dict[str, Any]]:
        """Extract images from PDF and try to detect chess boards"""
        if not HAS_IMAGE_PROCESSING or not HAS_PDF:
            logger.warning("Image processing dependencies not available")
            return []
        
        try:
            # Create a temporary directory for images
            temp_dir = tempfile.mkdtemp()
            images_with_metadata = []
            
            try:
                # Convert PDF pages to images
                if isinstance(pdf_content, bytes):
                    images = convert_from_bytes(pdf_content)
                else:
                    images = convert_from_path(pdf_content)
                
                # Process each page image
                for i, image in enumerate(images):
                    # Save the page image
                    image_path = os.path.join(temp_dir, f"page_{i+1}.png")
                    image.save(image_path, "PNG")
                    
                    # Process the image to detect chessboards
                    chess_positions = self._detect_chess_positions_in_image(image_path, i+1)
                    images_with_metadata.extend(chess_positions)
            finally:
                # Clean up temporary directory
                shutil.rmtree(temp_dir)
            
            return images_with_metadata
        
        except Exception as e:
            logger.error(f"Error extracting images from PDF: {e}")
            return []
    
    def _detect_chess_positions_in_image(self, image_path: str, page_number: int) -> List[Dict[str, Any]]:
        """Detect chess positions in an image"""
        positions = []
        
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                logger.warning(f"Could not read image from {image_path}")
                return positions
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect chessboard patterns (8x8 grid)
            found, corners = cv2.findChessboardCorners(gray, (7, 7), None)
            
            if found:
                # If chessboard pattern detected, extract the region
                rect = cv2.boundingRect(corners)
                x, y, w, h = rect
                chess_image = image[y:y+h, x:x+w]
                
                # Extract text surrounding the chessboard
                height, width = image.shape[:2]
                margin = 300  # Pixels to search for text around the chessboard
                
                # Calculate regions around the chessboard
                top_y = max(0, y - margin)
                bottom_y = min(height, y + h + margin)
                left_x = max(0, x - margin)
                right_x = min(width, x + w + margin)
                
                # Extract text from these regions
                surrounding_text = ""
                
                # Top region
                top_region = image[top_y:y, left_x:right_x]
                if top_region.size > 0:
                    top_text = pytesseract.image_to_string(top_region)
                    surrounding_text += top_text + " "
                
                # Bottom region
                bottom_region = image[y+h:bottom_y, left_x:right_x]
                if bottom_region.size > 0:
                    bottom_text = pytesseract.image_to_string(bottom_region)
                    surrounding_text += bottom_text + " "
                
                # Left region
                left_region = image[y:y+h, left_x:x]
                if left_region.size > 0:
                    left_text = pytesseract.image_to_string(left_region)
                    surrounding_text += left_text + " "
                
                # Right region
                right_region = image[y:y+h, x+w:right_x]
                if right_region.size > 0:
                    right_text = pytesseract.image_to_string(right_region)
                    surrounding_text += right_text + " "
                
                # Try to estimate FEN from the chess image
                fen_estimate = self._estimate_fen_from_chess_image(chess_image)
                
                # Look for a FEN string in the surrounding text
                fen_from_text = self._extract_fen_from_text(surrounding_text)
                
                # Use the detected FEN or the estimated one
                fen = fen_from_text if fen_from_text else fen_estimate
                
                # Create a temporary file for the chess image
                temp_image_path = os.path.join(tempfile.gettempdir(), f"chess_position_{uuid.uuid4()}.png")
                cv2.imwrite(temp_image_path, chess_image)
                
                # Get base64 encoding for the image
                with open(temp_image_path, "rb") as img_file:
                    img_data = base64.b64encode(img_file.read()).decode('utf-8')
                
                # Clean up
                os.remove(temp_image_path)
                
                # Add to positions list
                positions.append({
                    'page_number': page_number,
                    'fen': fen,
                    'image_data': img_data,
                    'surrounding_text': surrounding_text.strip(),
                    'position': {'x': x, 'y': y, 'width': w, 'height': h}
                })
        
        except Exception as e:
            logger.error(f"Error detecting chess positions: {e}")
        
        return positions
    
    def _estimate_fen_from_chess_image(self, chess_image) -> str:
        """Estimate FEN from a chess board image - simplified version"""
        try:
            # This is a simplified placeholder. In a real implementation, 
            # this would use more sophisticated computer vision techniques.
            
            # For now, return a default starting position
            return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        
        except Exception as e:
            logger.error(f"Error estimating FEN from image: {e}")
            return ""
    
    def save_book_to_json(self, book: ChessBook, filepath: str) -> None:
        """Save book to JSON file"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(book.dict(), f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            logger.error(f"Error saving book to JSON: {str(e)}")
            raise Exception(f"Failed to save book: {str(e)}")
    
    def load_book_from_json(self, filepath: str) -> ChessBook:
        """Load book from JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return ChessBook(**data)
        except Exception as e:
            logger.error(f"Error loading book from JSON: {str(e)}")
            raise Exception(f"Failed to load book: {str(e)}")
    
    def _extract_move_number(self, text: str) -> Optional[str]:
        """Extract move number from text"""
        move_match = re.search(r'(\d+\.{1,3}\s*[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)', text)
        if move_match:
            return move_match.group(1)
        return None
    
    def _extract_annotations(self, text: str) -> List[MoveAnnotation]:
        """Extract move annotations from text"""
        annotations = []
        
        # Look for common annotation symbols
        annotation_patterns = [
            (r'([!]{1,2})', 'Good move'),
            (r'([?]{1,2})', 'Poor move'),
            (r'([!?])', 'Interesting move'),
            (r'([?!])', 'Dubious move')
        ]
        
        for pattern, description in annotation_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                annotations.append(MoveAnnotation(
                    symbol=match.group(1),
                    text=description
                ))
        
        return annotations
    
    def _extract_diagrams(self, text: str) -> List[PositionDiagram]:
        """Extract position diagrams from text"""
        diagrams = []
        
        # Look for FEN positions that might be diagrams
        fen_matches = re.finditer(self.fen_pattern, text)
        for i, match in enumerate(fen_matches):
            # Look for caption before or after the FEN
            fen_pos = match.start()
            surrounding_text = text[max(0, fen_pos - 100):fen_pos + 200]
            
            # Simple caption extraction
            caption = f"Position {i + 1}"
            caption_match = re.search(r'(?:Diagram|Figure|Position)\s*\d*[:\s-]*([^.\n]+)', surrounding_text)
            if caption_match:
                caption = caption_match.group(1).strip()
            
            diagrams.append(PositionDiagram(
                fen=match.group(0),
                caption=caption
            ))
        
        return diagrams
    
    def _integrate_image_positions(self, chapters: List[Chapter], chess_positions_from_images: List[Dict[str, Any]]) -> None:
        """Integrate chess positions from images into the appropriate chapters/pages"""
        if not chess_positions_from_images:
            return
            
        # Create a mapping of page numbers to chapter/page indices
        page_map = {}
        page_counter = 1
        
        for chapter_idx, chapter in enumerate(chapters):
            for page_idx, _ in enumerate(chapter.pages):
                page_map[page_counter] = (chapter_idx, page_idx)
                page_counter += 1
        
        # Add positions to the appropriate pages
        for position in chess_positions_from_images:
            page_number = position.get('page_number')
            if page_number in page_map:
                chapter_idx, page_idx = page_map[page_number]
                
                # Add position to the page
                if position.get('fen'):
                    # Set the position if not already set
                    if not chapters[chapter_idx].pages[page_idx].position:
                        chapters[chapter_idx].pages[page_idx].position = position.get('fen')
                    
                    # Add as diagram
                    diagram = PositionDiagram(
                        type="position_diagram",
                        fen=position.get('fen'),
                        caption=position.get('surrounding_text', '')[:100]  # Use first 100 chars as caption
                    )
                    chapters[chapter_idx].pages[page_idx].diagrams.append(diagram)
                    
                    # Check if this position looks like it might be an exercise
                    surrounding_text = position.get('surrounding_text', '').lower()
                    if any(term in surrounding_text for term in ['exercise', 'problem', 'puzzle', 'question']):
                        # Try to extract exercise details
                        question = surrounding_text[:200]  # Use first 200 chars as question
                        
                        # Look for solution in surrounding text
                        solution = ""
                        for pattern in self.solution_patterns:
                            solution_match = re.search(pattern, surrounding_text)
                            if solution_match:
                                solution = solution_match.group(1)
                                break
                        
                        # Create exercise if solution found
                        if solution:
                            difficulty = self._determine_exercise_difficulty(surrounding_text)
                            exercise_type = self._determine_exercise_type(surrounding_text)
                            
                            exercise = Exercise(
                                id=len(chapters[chapter_idx].pages[page_idx].exercises) + 1,
                                question=question,
                                fen=position.get('fen'),
                                solution=solution,
                                explanation=solution,  # Use solution as explanation if none found
                                difficulty=difficulty,
                                type=exercise_type
                            )
                            chapters[chapter_idx].pages[page_idx].exercises.append(exercise)
        def _detect_chess_positions_in_image(self, image_path: str, page_number: int) -> List[Dict[str, Any]]:
            """Detect chess positions in an image."""
            positions = []
            try:
                image = cv2.imread(image_path)
                if image is None:
                    logger.warning(f"Could not read image from {image_path}")
                    return positions

                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

                found, corners = cv2.findChessboardCorners(binary, (7, 7), None)
                if found:
                    rect = cv2.boundingRect(corners)
                    x, y, w, h = rect
                    chess_image = image[y:y+h, x:x+w]

                    surrounding_text = pytesseract.image_to_string(image[max(0, y-100):min(image.shape[0], y+h+100), :])
                    fen = self._extract_fen_from_text(surrounding_text) or self._estimate_fen_from_chess_image(chess_image)

                    temp_image_path = os.path.join(tempfile.gettempdir(), f"chess_position_{uuid.uuid4()}.png")
                    cv2.imwrite(temp_image_path, chess_image)
                    with open(temp_image_path, "rb") as img_file:
                        img_data = base64.b64encode(img_file.read()).decode('utf-8')
                    os.remove(temp_image_path)

                    positions.append({
                        'page_number': page_number,
                        'fen': fen,
                        'image_data': img_data,
                        'surrounding_text': surrounding_text.strip(),
                        'position': {'x': x, 'y': y, 'width': w, 'height': h}
                    })
            except Exception as e:
                logger.error(f"Error detecting chess positions: {e}")
            return positions

        def _estimate_fen_from_chess_image(self, chess_image) -> str:
            """Estimate FEN from a chess board image."""
            try:
                resized_image = cv2.resize(chess_image, (400, 400))
                gray = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY)
                binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

                # Placeholder logic for FEN estimation
                return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            except Exception as e:
                logger.error(f"Error estimating FEN from image: {e}")
                return ""

        def save_book_to_json(self, book: ChessBook, filepath: str) -> None:
            """Save book to JSON file."""
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(book.dict(), f, indent=2, ensure_ascii=False, default=str)
            except Exception as e:
                logger.error(f"Error saving book to JSON: {e}")
                raise Exception(f"Failed to save book: {e}")

        def load_book_from_json(self, filepath: str) -> ChessBook:
            """Load book from JSON file."""
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return ChessBook(**data)
            except Exception as e:
                logger.error(f"Error loading book from JSON: {e}")
                raise Exception(f"Failed to load book: {e}")
        def _parse_chapters(self, text: str) -> List[Chapter]:
            """
            Split the book text into chapters using chapter_patterns.
            Each chapter contains pages (for now, treat each chapter as one page).
            """
            import re
            chapters = []
            matches = []
            # Find all chapter headers
            for pattern in self.chapter_patterns:
                for match in re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE):
                    matches.append((match.start(), match, pattern))
            # Sort by position in text
            matches.sort(key=lambda x: x[0])
            # If no chapters found, treat whole text as one chapter
            if not matches:
                chapters.append(Chapter(
                    id=1,
                    title="Main Content",
                    pages=[self._parse_page(text, 1)]
                ))
                return chapters
            # Otherwise, split text into chapters
            for idx, (start, match, pattern) in enumerate(matches):
                end = matches[idx + 1][0] if idx + 1 < len(matches) else len(text)
                chapter_text = text[start:end].strip()
                # Extract chapter title
                if match.lastindex and match.lastindex >= 2:
                    title = match.group(2).strip()
                elif match.lastindex and match.lastindex >= 1:
                    title = match.group(1).strip()
                else:
                    title = match.group(0).strip()
                chapters.append(Chapter(
                    id=idx + 1,
                    title=title,
                    pages=[self._parse_page(chapter_text, 1)]
                ))
            return chapters

    def _parse_page(self, text: str, page_id: int) -> Page:
        """
        Parse a page from text. Extract FEN, moves, annotations, diagrams, and exercises.
        """
        # Extract FEN (first found)
        fen_match = re.search(self.fen_pattern, text)
        fen = fen_match.group(0) if fen_match else None
        # Extract move number (first found)
        move_number = self._extract_move_number(text)
        # Extract annotations
        annotations = self._extract_annotations(text)
        # Extract diagrams
        diagrams = self._extract_diagrams(text)
        # Extract exercises
        exercises = self._extract_exercises(text)
        return Page(
            id=page_id,
            content=text.strip(),
            position=fen,
            moveNumber=move_number,
            annotations=annotations,
            diagrams=diagrams,
            exercises=exercises
        )

    def _extract_exercises(self, text: str) -> List[Exercise]:
        """
        Extract exercises from text using exercise_patterns.
        """
        exercises = []
        for pattern in self.exercise_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE | re.DOTALL):
                question = match.group(2).strip() if match.lastindex and match.lastindex >= 2 else match.group(0).strip()
                # Try to find FEN in the question or nearby
                fen_match = re.search(self.fen_pattern, question)
                fen = fen_match.group(0) if fen_match else None
                # Try to find solution and explanation
                solution = ""
                for sol_pat in self.solution_patterns:
                    sol_match = re.search(sol_pat, text, re.IGNORECASE)
                    if sol_match:
                        solution = sol_match.group(1).strip()
                        break
                explanation = ""
                for exp_pat in self.explanation_patterns:
                    exp_match = re.search(exp_pat, text, re.IGNORECASE)
                    if exp_match:
                        explanation = exp_match.group(1).strip()
                        break
                # Guess difficulty/type
                difficulty = self._determine_exercise_difficulty(question)
                ex_type = self._determine_exercise_type(question)
                exercises.append(Exercise(
                    id=len(exercises) + 1,
                    question=question,
                    fen=fen or "",
                    solution=solution,
                    explanation=explanation,
                    difficulty=difficulty,
                    type=ex_type
                ))
        return exercises

    def _determine_exercise_difficulty(self, text: str) -> str:
        text = text.lower()
        if "beginner" in text:
            return "beginner"
        if "advanced" in text:
            return "advanced"
        return "intermediate"

    def _determine_exercise_type(self, text: str) -> str:
        text = text.lower()
        if "tactic" in text or "puzzle" in text:
            return "tactical"
        if "endgame" in text:
            return "endgame"
        if "opening" in text:
            return "opening"
        return "strategic"