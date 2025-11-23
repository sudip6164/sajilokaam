@echo off
REM API Integration Test Runner (Windows)
REM Assumes docker-compose is already running

echo.
echo 🧪 Running API Integration Tests
echo ==================================
echo.
echo Prerequisites:
echo   - Docker compose must be running (backend + mysql)
echo   - Backend accessible at http://localhost:8080
echo.

cd backend

echo Running tests...
call mvnw.cmd test -Dtest=ApiIntegrationTest

echo.
echo ✅ Tests completed!
echo.
echo Check the output above for test results.
pause

