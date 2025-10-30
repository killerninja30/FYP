@echo off
REM Setup script for IoT Energy Management Backend (Windows)

echo 🔧 Setting up IoT Energy Management Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Create database
echo 🗄️ Initializing database...
python -c "from app.database.database import init_db; init_db(); print('Database initialized successfully!')"

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the backend server:
echo    For development: python main.py
echo    For production: uvicorn main:app --host 0.0.0.0 --port 8000
echo.
echo 📡 API will be available at: http://localhost:8000
echo 📚 API documentation: http://localhost:8000/docs
echo 🔄 API status: http://localhost:8000/health
echo.
pause