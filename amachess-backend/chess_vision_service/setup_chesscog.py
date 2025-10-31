#!/usr/bin/env python3
"""
Setup script for installing Chesscog
"""

import subprocess
import sys
import os

def run_command(command, shell=False):
    """Run a command and return success status"""
    try:
        if shell:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        else:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr
    except Exception as e:
        return False, str(e)

def install_chesscog():
    """Install Chesscog from GitHub"""
    print("Installing Chesscog from GitHub...")
    
    # Install chesscog
    success, output = run_command([
        sys.executable, "-m", "pip", "install", 
        "git+https://github.com/georg-wolflein/chesscog.git"
    ])
    
    if success:
        print("✅ Chesscog installed successfully")
        return True
    else:
        print("❌ Failed to install Chesscog")
        print(output)
        return False

def download_models():
    """Download pre-trained models"""
    print("Downloading pre-trained models...")
    
    # Download occupancy classifier model
    print("  Downloading occupancy classifier model...")
    success, output = run_command([
        sys.executable, "-m", "chesscog.occupancy_classifier.download_model"
    ])
    
    if not success:
        print("❌ Failed to download occupancy classifier model")
        print(output)
        return False
    
    # Download piece classifier model
    print("  Downloading piece classifier model...")
    success, output = run_command([
        sys.executable, "-m", "chesscog.piece_classifier.download_model"
    ])
    
    if not success:
        print("❌ Failed to download piece classifier model")
        print(output)
        return False
    
    print("✅ All models downloaded successfully")
    return True

def test_chesscog():
    """Test if Chesscog is working"""
    print("Testing Chesscog installation...")
    
    test_script = '''
try:
    from chesscog.recognition.recognition import ChessRecognizer
    from chesscog.core.models import get_model
    print("✅ Chesscog imports successful")
    
    # Try to initialize recognizer
    recognizer = ChessRecognizer()
    print("✅ Chesscog recognizer initialized")
    
    print("Chesscog is ready to use!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Chesscog is not properly installed")
    
except Exception as e:
    print(f"❌ Error initializing Chesscog: {e}")
    print("Chesscog may not be fully configured")
'''
    
    success, output = run_command([sys.executable, "-c", test_script])
    
    if success:
        print("✅ Chesscog test passed")
        print(output)
        return True
    else:
        print("❌ Chesscog test failed")
        print(output)
        return False

def main():
    """Main setup function"""
    print("Chesscog Setup Script")
    print("=" * 40)
    
    # Check if we're in a virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Running in virtual environment")
    else:
        print("⚠️  Not in virtual environment - you may want to activate one")
    
    # Install Chesscog
    if not install_chesscog():
        print("❌ Setup failed at Chesscog installation")
        return False
    
    # Download models
    if not download_models():
        print("❌ Setup failed at model download")
        return False
    
    # Test installation
    if not test_chesscog():
        print("❌ Setup failed at testing")
        return False
    
    print("\n" + "=" * 40)
    print("✅ Chesscog setup completed successfully!")
    print("\nYou can now:")
    print("1. Use app_with_chesscog.py for real FEN extraction")
    print("2. Test with: python app_with_chesscog.py")
    print("3. The service will use Chesscog for chess position recognition")
    
    return True

if __name__ == "__main__":
    if main():
        sys.exit(0)
    else:
        sys.exit(1)
