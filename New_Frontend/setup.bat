@echo off
echo ================================================
echo IoT Energy Management System - Frontend Setup
echo ================================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/4] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully

echo.
echo [3/4] Checking backend connectivity...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend API is not running on http://localhost:8000
    echo Please start the backend first by running:
    echo   cd ../FYP_Backend
    echo   python main.py
    echo.
) else (
    echo ✓ Backend API is running
)

echo.
echo [4/4] Setup complete!
echo.
echo ================================================
echo Frontend Setup Instructions:
echo ================================================
echo.
echo 1. Start the backend API first (if not already running):
echo    cd ../FYP_Backend
echo    python main.py
echo.
echo 2. Start the frontend development server:
echo    npm start
echo.
echo 3. Open your browser and navigate to:
echo    http://localhost:3000
echo.
echo ================================================
echo Available Scripts:
echo ================================================
echo npm start          - Start development server
echo npm run build      - Build for production
echo npm test           - Run tests
echo.
echo For more information, see README.md
echo.
pause