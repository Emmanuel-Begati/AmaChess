#!/usr/bin/env python3
"""
Setup script for Chess Vision Service
Installs dependencies and sets up the environment
"""

import os
import sys
import subprocess
import platform

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

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    else:
        print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
        return True

def check_pip():
    """Check if pip is available"""
    success, output = run_command([sys.executable, "-m", "pip", "--version"])
    if success:
        print(f"✅ pip is available")
        return True
    else:
        print("❌ pip is not available")
        print("   Please install pip first")
        return False

def install_system_dependencies():
    """Install system dependencies based on platform"""
    system = platform.system().lower()
    
    print(f"Detected system: {system}")
    
    if system == "linux":
        print("Installing poppler-utils for Linux...")
        # Try different package managers
        for cmd in [
            "sudo apt-get update && sudo apt-get install -y poppler-utils",
            "sudo yum install -y poppler-utils",
            "sudo pacman -S poppler"
        ]:
            success, output = run_command(cmd, shell=True)
            if success:
                print("✅ poppler-utils installed")
                return True
        print("❌ Could not install poppler-utils automatically")
        print("   Please install manually using your package manager")
        return False
        
    elif system == "darwin":  # macOS
        print("Checking for Homebrew...")
        success, output = run_command(["brew", "--version"])
        if success:
            print("Installing poppler via Homebrew...")
            success, output = run_command(["brew", "install", "poppler"])
            if success:
                print("✅ poppler installed via Homebrew")
                return True
            else:
                print("❌ Failed to install poppler via Homebrew")
                print(output)
                return False
        else:
            print("❌ Homebrew not found")
            print("   Please install Homebrew first or install poppler manually")
            return False
            
    elif system == "windows":
        print("⚠️  Windows detected")
        print("   Please install poppler manually:")
        print("   1. Download from: https://github.com/oschwartz10612/poppler-windows/releases")
        print("   2. Extract and add to PATH")
        print("   3. Restart your terminal")
        return True
    
    else:
        print(f"❌ Unsupported system: {system}")
        return False

def create_virtual_environment():
    """Create a virtual environment"""
    if os.path.exists("venv"):
        print("✅ Virtual environment already exists")
        return True
    
    print("Creating virtual environment...")
    success, output = run_command([sys.executable, "-m", "venv", "venv"])
    if success:
        print("✅ Virtual environment created")
        return True
    else:
        print("❌ Failed to create virtual environment")
        print(output)
        return False

def get_venv_python():
    """Get the path to the virtual environment Python"""
    system = platform.system().lower()
    if system == "windows":
        return os.path.join("venv", "Scripts", "python.exe")
    else:
        return os.path.join("venv", "bin", "python")

def get_venv_pip():
    """Get the path to the virtual environment pip"""
    system = platform.system().lower()
    if system == "windows":
        return os.path.join("venv", "Scripts", "pip.exe")
    else:
        return os.path.join("venv", "bin", "pip")

def install_python_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    
    # Upgrade pip first
    pip_path = get_venv_pip()
    success, output = run_command([pip_path, "install", "--upgrade", "pip"])
    if not success:
        print("⚠️  Failed to upgrade pip, continuing...")
    
    # Install requirements
    success, output = run_command([pip_path, "install", "-r", "requirements.txt"])
    if success:
        print("✅ Python dependencies installed")
        return True
    else:
        print("❌ Failed to install Python dependencies")
        print(output)
        return False

def create_directories():
    """Create necessary directories"""
    directories = ["temp_uploads", "pdf_cache"]
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"✅ Directory already exists: {directory}")

def test_installation():
    """Test if the installation works"""
    print("Testing installation...")
    
    python_path = get_venv_python()
    
    # Test imports
    test_script = '''
import flask
import cv2
import numpy as np
from pdf2image import convert_from_bytes
import requests
print("All imports successful!")
'''
    
    success, output = run_command([python_path, "-c", test_script])
    if success:
        print("✅ All dependencies can be imported")
        return True
    else:
        print("❌ Import test failed")
        print(output)
        return False

def main():
    """Main setup function"""
    print("Chess Vision Service Setup")
    print("=" * 40)
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_pip():
        sys.exit(1)
    
    # Install system dependencies
    if not install_system_dependencies():
        print("⚠️  System dependencies may not be installed correctly")
        print("   The service may not work properly")
    
    # Create virtual environment
    if not create_virtual_environment():
        sys.exit(1)
    
    # Install Python dependencies
    if not install_python_dependencies():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Test installation
    if not test_installation():
        print("⚠️  Installation test failed")
        print("   The service may not work correctly")
    
    print("\n" + "=" * 40)
    print("✅ Setup completed successfully!")
    print("\nTo start the service:")
    print("  Linux/macOS: ./start.sh")
    print("  Windows:     start.bat")
    print("  Manual:      source venv/bin/activate && python app.py")
    print("\nThe service will run on: http://localhost:5000")

if __name__ == "__main__":
    main()
