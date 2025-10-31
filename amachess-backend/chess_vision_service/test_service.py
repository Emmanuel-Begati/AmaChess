#!/usr/bin/env python3
"""
Simple test script to verify our chess vision service endpoints.
This script tests the mock implementation functionality.
"""

import requests
import json
import numpy as np
from PIL import Image
import io

# Configuration
BASE_URL = "http://localhost:5001"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{SERVICE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print("❌ Health check failed")
            print(f"   Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to service. Is it running on localhost:5000?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    return True

def test_detect_boards():
    """Test the detect-boards endpoint with mock data"""
    print("\nTesting detect-boards endpoint...")
    
    # Since we don't have a real PDF file, we'll test the error handling
    try:
        # Test without file
        response = requests.post(f"{SERVICE_URL}/detect-boards")
        if response.status_code == 400:
            print("✅ Correctly handles missing PDF file")
            print(f"   Error: {response.json()['message']}")
        else:
            print("❌ Should have returned 400 for missing file")
    except Exception as e:
        print(f"❌ Error testing detect-boards: {e}")
        return False
    
    # Test with invalid file type
    try:
        files = {'pdf': ('test.txt', b'This is not a PDF', 'text/plain')}
        response = requests.post(f"{SERVICE_URL}/detect-boards", files=files)
        if response.status_code == 400:
            print("✅ Correctly handles invalid file type")
            print(f"   Error: {response.json()['message']}")
        else:
            print("❌ Should have returned 400 for invalid file type")
    except Exception as e:
        print(f"❌ Error testing invalid file type: {e}")
        return False
    
    return True

def test_extract_fen():
    """Test the extract_fen endpoint"""
    print("\nTesting extract_fen endpoint...")
    
    # Test with missing data
    try:
        response = requests.post(f"{SERVICE_URL}/extract_fen")
        if response.status_code == 400:
            print("✅ Correctly handles missing JSON data")
            print(f"   Error: {response.json()['message']}")
        else:
            print("❌ Should have returned 400 for missing data")
    except Exception as e:
        print(f"❌ Error testing missing data: {e}")
        return False
    
    # Test with incomplete data
    try:
        data = {"page": 1, "x": 100}  # Missing y, width, height
        response = requests.post(f"{SERVICE_URL}/extract_fen", json=data)
        if response.status_code == 400:
            print("✅ Correctly handles incomplete data")
            print(f"   Error: {response.json()['message']}")
        else:
            print("❌ Should have returned 400 for incomplete data")
    except Exception as e:
        print(f"❌ Error testing incomplete data: {e}")
        return False
    
    # Test with valid data (should return mock FEN)
    try:
        data = {
            "page": 1,
            "x": 100,
            "y": 150,
            "width": 200,
            "height": 200
        }
        response = requests.post(f"{SERVICE_URL}/extract_fen", json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Successfully extracted FEN (mock)")
            print(f"   FEN: {result['fen']}")
            print(f"   Confidence: {result['confidence']}")
        else:
            print("❌ FEN extraction failed")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing FEN extraction: {e}")
        return False
    
    return True

def test_clear_cache():
    """Test the clear-cache endpoint"""
    print("\nTesting clear-cache endpoint...")
    try:
        response = requests.post(f"{SERVICE_URL}/clear-cache")
        if response.status_code == 200:
            print("✅ Cache cleared successfully")
            print(f"   Response: {response.json()['message']}")
        else:
            print("❌ Cache clear failed")
            print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing cache clear: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("Chess Vision Service Test Suite")
    print("=" * 40)
    
    # Test all endpoints
    tests = [
        test_health_check,
        test_detect_boards,
        test_extract_fen,
        test_clear_cache
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n{'='*40}")
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
