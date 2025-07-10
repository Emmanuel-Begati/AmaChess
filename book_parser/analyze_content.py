#!/usr/bin/env python3
"""Improved test to understand the parsing issues better"""

import sys
import os
import re

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from parser import ChessBookParser

def analyze_content():
    """Analyze the content structure to understand parsing issues"""
    
    # Read the sample book
    with open('sample_book.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("=== CONTENT ANALYSIS ===")
    print(f"Content length: {len(content)}")
    print()
    
    # Test chapter patterns
    parser = ChessBookParser()
    
    print("=== CHAPTER PATTERN MATCHES ===")
    for i, pattern in enumerate(parser.chapter_patterns):
        print(f"Pattern {i+1}: {pattern}")
        matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            print(f"  Match: {match.group(0)[:50]}... at position {match.start()}-{match.end()}")
            if len(match.groups()) >= 2:
                print(f"    Group 1: {match.group(1)}")
                print(f"    Group 2: {match.group(2)}")
        print()
    
    print("=== EXERCISE PATTERN MATCHES ===")
    for i, pattern in enumerate(parser.exercise_patterns):
        print(f"Pattern {i+1}: {pattern}")
        matches = re.finditer(pattern, content, re.IGNORECASE | re.DOTALL)
        for match in matches:
            print(f"  Match: {match.group(0)[:80]}... at position {match.start()}-{match.end()}")
        print()
    
    print("=== SOLUTION PATTERN MATCHES ===")
    for i, pattern in enumerate(parser.solution_patterns):
        print(f"Pattern {i+1}: {pattern}")
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            print(f"  Match: {match.group(0)[:80]}... at position {match.start()}-{match.end()}")
            if len(match.groups()) >= 1:
                print(f"    Solution: {match.group(1)}")
        print()
    
    print("=== EXPLANATION PATTERN MATCHES ===")
    for i, pattern in enumerate(parser.explanation_patterns):
        print(f"Pattern {i+1}: {pattern}")
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            print(f"  Match: {match.group(0)[:80]}... at position {match.start()}-{match.end()}")
            if len(match.groups()) >= 1:
                print(f"    Explanation: {match.group(1)}")
        print()

if __name__ == "__main__":
    analyze_content()
