#!/usr/bin/env python3
"""Test script for the ChessBookParser"""

import sys
import os
import json

# Add the current directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from parser import ChessBookParser

def test_parser():
    """Test the parser with sample content"""
    print("Testing ChessBookParser...")
    
    # Read the sample book
    with open('sample_book.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"Sample content length: {len(content)} characters")
    print(f"First 200 characters: {repr(content[:200])}")
    
    # Create parser and test
    parser = ChessBookParser()
    
    try:
        # Test parsing
        book = parser.parse_book(content, "sample_book.txt", "Sample Chess Book", "Test Author")
        
        print(f"\n✓ Successfully parsed book!")
        print(f"  Title: {book.title}")
        print(f"  Author: {book.author}")
        print(f"  Total Positions: {book.totalPositions}")
        print(f"  Chapters: {len(book.chapters)}")
        print(f"  Practice Positions: {len(book.practicePositions)}")
        
        # Test each chapter
        for i, chapter in enumerate(book.chapters):
            print(f"\n  Chapter {i+1}:")
            print(f"    ID: {chapter.id}")
            print(f"    Title: {repr(chapter.title)}")
            print(f"    Pages: {len(chapter.pages)}")
            
            # Test each page
            for j, page in enumerate(chapter.pages):
                print(f"    Page {j+1}:")
                print(f"      Content length: {len(page.content) if page.content else 0}")
                print(f"      Has position: {bool(page.position)}")
                if page.position:
                    print(f"      Position: {page.position}")
                print(f"      Exercises: {len(page.exercises)}")
                
                # Test exercises
                for k, exercise in enumerate(page.exercises):
                    print(f"      Exercise {k+1}:")
                    print(f"        Question: {repr(exercise.question[:50])}")
                    print(f"        Solution: {repr(exercise.solution)}")
                    print(f"        FEN: {exercise.fen}")
                    print(f"        Difficulty: {exercise.difficulty}")
                    print(f"        Type: {exercise.type}")
        
        # Test metadata
        print(f"\n  Metadata:")
        print(f"    Total Pages: {book.metadata.totalPages}")
        print(f"    Total Chapters: {book.metadata.totalChapters}")
        print(f"    Difficulty: {book.metadata.difficulty}")
        print(f"    Topics: {book.metadata.topics}")
        print(f"    Format: {book.metadata.format}")
        
        # Test saving to JSON
        test_file = "test_output.json"
        parser.save_book_to_json(book, test_file)
        
        # Verify JSON structure
        with open(test_file, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        print(f"\n✓ JSON saved successfully!")
        print(f"  JSON size: {len(json.dumps(json_data))} characters")
        
        # Verify key fields
        required_fields = ['id', 'title', 'author', 'totalPositions', 'chapters', 'practicePositions', 'metadata']
        missing_fields = [field for field in required_fields if field not in json_data]
        
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
        else:
            print("✓ All required fields present")
        
        # Check if chapters have proper content
        if json_data['chapters']:
            first_chapter = json_data['chapters'][0]
            print(f"  First chapter title: {repr(first_chapter.get('title', 'MISSING'))}")
            if first_chapter.get('pages'):
                first_page = first_chapter['pages'][0]
                print(f"  First page content length: {len(first_page.get('content', ''))}")
                print(f"  First page content preview: {repr(first_page.get('content', '')[:100])}")
        
        # Clean up
        if os.path.exists(test_file):
            os.remove(test_file)
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_parser()
    if success:
        print("\n🎉 Parser test completed successfully!")
    else:
        print("\n💥 Parser test failed!")
        sys.exit(1)
