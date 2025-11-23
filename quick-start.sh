#!/bin/bash

# Quick Start Script for SajiloKaam
# This script helps you start the application quickly

echo "🚀 SajiloKaam Quick Start"
echo "=========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating a basic one..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 48)
DB_USER=root
DB_PASSWORD=
EOF
    echo "✅ Created .env file with random JWT_SECRET"
    echo ""
fi

echo "📦 Starting services..."
echo ""

# Start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Services should be starting up!"
echo ""
echo "📍 Access Points:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8080"
echo "   phpMyAdmin: http://localhost:8081"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Email:    admin@sajilokaam.com"
echo "   Password: admin123"
echo ""
echo "📚 For detailed testing instructions, see TESTING_GUIDE.md"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""

