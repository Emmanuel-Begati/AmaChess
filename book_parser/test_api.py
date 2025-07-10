import asyncio
import aiohttp
import json
import os
from io import BytesIO

async def test_api():
    """Test the API endpoints"""
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        try:
            # Test health check
            print("Testing health check...")
            async with session.get(f"{base_url}/health") as response:
                data = await response.json()
                print(f"Health check: {data}")
            
            # Test root endpoint
            print("\nTesting root endpoint...")
            async with session.get(f"{base_url}/") as response:
                data = await response.json()
                print(f"Root: {data}")
            
            # Test list books (should be empty initially)
            print("\nTesting list books...")
            async with session.get(f"{base_url}/books") as response:
                data = await response.json()
                print(f"Books: {data}")
            
            # Test upload book with sample content
            print("\nTesting book upload...")
            sample_content = """
            Chapter 1: Introduction to Chess
            
            The game of chess is played on a board with 64 squares arranged in an 8x8 grid.
            
            Starting position: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
            
            1.e4 e5 2.Nf3 Nc6 3.Bb5
            
            Exercise 1: What is the best move for Black?
            Position: r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3
            Solution: a6
            Explanation: Attacking the bishop forces it to make a decision.
            
            Chapter 2: Basic Tactics
            
            Tactics are short-term combinations that win material or achieve checkmate.
            
            Position: r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4
            
            4.Ng5 d6 5.exd6
            
            Exercise 2: Find the winning move for White.
            Position: r1bqkb1r/ppp2ppp/3p1n2/6N1/2B1P3/8/PPP2PPP/RNBQK2R w KQkq - 0 6
            Solution: Nxf7
            Explanation: This knight fork attacks both the king and queen.
            """
            
            data = aiohttp.FormData()
            data.add_field('file', BytesIO(sample_content.encode()), 
                          filename='sample_book.txt', content_type='text/plain')
            data.add_field('title', 'Sample Chess Book')
            data.add_field('author', 'Test Author')
            data.add_field('cover_url', 'https://example.com/cover.jpg')
            
            async with session.post(f"{base_url}/upload-book", data=data) as response:
                result = await response.json()
                print(f"Upload result: {result}")
                
                if result.get('success'):
                    book_id = result['book_id']
                    
                    # Test get book
                    print(f"\nTesting get book {book_id}...")
                    async with session.get(f"{base_url}/books/{book_id}") as response:
                        book_data = await response.json()
                        print(f"Book data: {json.dumps(book_data, indent=2)}")
                    
                    # Test get chapters
                    print(f"\nTesting get chapters for book {book_id}...")
                    async with session.get(f"{base_url}/books/{book_id}/chapters") as response:
                        chapters_data = await response.json()
                        print(f"Chapters: {json.dumps(chapters_data, indent=2)}")
                    
                    # Test get positions
                    print(f"\nTesting get positions for book {book_id}...")
                    async with session.get(f"{base_url}/books/{book_id}/positions") as response:
                        positions_data = await response.json()
                        print(f"Positions: {json.dumps(positions_data, indent=2)}")
                    
                    # Test get exercises
                    print(f"\nTesting get exercises for book {book_id}...")
                    async with session.get(f"{base_url}/books/{book_id}/exercises") as response:
                        exercises_data = await response.json()
                        print(f"Exercises: {json.dumps(exercises_data, indent=2)}")
                    
                    # Test get practice positions
                    print(f"\nTesting get practice positions for book {book_id}...")
                    async with session.get(f"{base_url}/books/{book_id}/practice-positions") as response:
                        practice_data = await response.json()
                        print(f"Practice positions: {json.dumps(practice_data, indent=2)}")
        
        except Exception as e:
            print(f"Error testing API: {e}")

if __name__ == "__main__":
    print("Starting API test...")
    print("Make sure the server is running on http://localhost:8000")
    asyncio.run(test_api())
