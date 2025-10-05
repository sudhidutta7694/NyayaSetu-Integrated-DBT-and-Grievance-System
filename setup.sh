#!/bin/bash

# NyayaSetu Setup Script
# This script sets up the development environment for the NyayaSetu DBT System

set -e

echo "🚀 Setting up NyayaSetu - Integrated DBT and Grievance System"
echo "=============================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/profile_images
mkdir -p nginx/ssl
mkdir -p frontend/public/images

# Set permissions
chmod 755 backend/uploads
chmod 755 backend/uploads/documents
chmod 755 backend/uploads/profile_images

echo "✅ Directories created successfully."

# Start the development environment
echo "🐳 Starting Docker containers..."
docker compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Generate Prisma client
echo "🔧 Generating Prisma client..."
prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database..."
python prisma/seed.py

cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

cd ..

# Start all services
echo "🚀 Starting all services..."
docker compose up -d

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo "   Database: localhost:5432"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Email: admin@nyayasetu.gov.in"
echo "   Phone: +919876543210"
echo ""
echo "📚 Next Steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Visit http://localhost:3000 to access the application"
echo "   3. Check the API documentation at http://localhost:8000/docs"
echo ""
echo "🛠️ Development Commands:"
echo "   docker compose up -d          # Start all services"
echo "   docker compose down           # Stop all services"
echo "   docker compose logs -f        # View logs"
echo "   docker compose restart        # Restart services"
echo ""
echo "Happy coding! 🎉"
