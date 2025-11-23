@echo off
REM Quick Start Script for SajiloKaam (Windows)
REM This script helps you start the application quickly

echo.
echo 🚀 SajiloKaam Quick Start
echo ==========================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating a basic one...
    (
        echo JWT_SECRET=change-me-to-a-secure-random-string-at-least-48-characters-long
        echo DB_USER=root
        echo DB_PASSWORD=
    ) > .env
    echo ✅ Created .env file
    echo ⚠️  Please update JWT_SECRET in .env file with a secure random string
    echo.
)

echo 📦 Starting services...
echo.

REM Start services
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Services should be starting up!
echo.
echo 📍 Access Points:
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:8080
echo    phpMyAdmin: http://localhost:8081
echo.
echo 👤 Default Admin Credentials:
echo    Email:    admin@sajilokaam.com
echo    Password: admin123
echo.
echo 📚 For detailed testing instructions, see TESTING_GUIDE.md
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.
pause

