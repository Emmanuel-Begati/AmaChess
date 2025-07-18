#!/usr/bin/env python3
"""
Simple test script to verify our chess vision service endpoints.
This script tests the mock implementation functionality.
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5001"

def test_health():
    """Test the health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_chesscog():
    """Test the chesscog functionality."""
    print("\nTesting chesscog functionality...")
    try:
        response = requests.get(f"{BASE_URL}/test-chesscog")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_cache_info():
    """Test the cache info endpoint."""
    print("\nTesting cache info...")
    try:
        response = requests.get(f"{BASE_URL}/cache-info")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests."""
    print("=== Chess Vision Service Test Suite ===\n")
    
    # Test basic endpoints
    tests = [
        ("Health Check", test_health),
        ("Chesscog Test", test_chesscog),
        ("Cache Info", test_cache_info),
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
        print(f"✓ {test_name}: {'PASS' if result else 'FAIL'}")
    
    # Summary
    print(f"\n=== Test Summary ===")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("All tests passed! ✓")
    else:
        print("Some tests failed. ✗")
    
    return passed == total

if __name__ == "__main__":
    main()
