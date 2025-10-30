#!/bin/bash

# Setup script for IoT Energy Management Backend
# This script installs dependencies and starts the backend server

echo "🔧 Setting up IoT Energy Management Backend..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate  # For Linux/Mac
# For Windows: venv\Scripts\activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create database
echo "🗄️ Initializing database..."
python -c "from app.database.database import init_db; init_db(); print('Database initialized successfully!')"

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the backend server:"
echo "   For development: python main.py"
echo "   For production: uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "📡 API will be available at: http://localhost:8000"
echo "📚 API documentation: http://localhost:8000/docs"
echo "🔄 API status: http://localhost:8000/health"