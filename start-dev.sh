#!/bin/bash

# NyayaSetu DBT System Development Startup Script
# This script starts the system in development mode with hot reloading

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=========================================="
echo "🚀 NyayaSetu DBT System - Development Mode"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

# Set the compose command to use
if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

print_status "Using Docker Compose command: $COMPOSE_CMD"

# Stop any existing containers
print_status "Stopping any existing containers..."
$COMPOSE_CMD down --remove-orphans >/dev/null 2>&1 || true

# Start database services
print_status "Starting database services..."
$COMPOSE_CMD up -d postgres redis

# Wait for databases to be ready
print_status "Waiting for databases to be ready..."
sleep 10

# Generate and run database migrations
print_status "Generating Prisma client..."
$COMPOSE_CMD run --rm backend prisma generate

print_status "Creating initial migration if needed..."
$COMPOSE_CMD run --rm backend prisma migrate dev --name init --create-only || true

print_status "Deploying database migrations..."
$COMPOSE_CMD run --rm backend prisma migrate deploy

# Start backend in development mode (with volume mounting for hot reload)
print_status "Starting backend in development mode..."
$COMPOSE_CMD up -d backend

# Start frontend in development mode (with volume mounting for hot reload)
print_status "Starting frontend in development mode..."
$COMPOSE_CMD up -d frontend

# Start nginx
print_status "Starting Nginx..."
$COMPOSE_CMD up -d nginx

echo ""
echo "=========================================="
print_success "🎉 Development environment is ready!"
echo "=========================================="
echo ""
echo "📱 Frontend (Next.js):     http://localhost:3000"
echo "🔧 Backend API (FastAPI):  http://localhost:8000"
echo "📚 API Documentation:      http://localhost:8000/docs"
echo ""
echo "🔄 Hot Reloading Enabled:"
echo "   • Frontend changes will auto-reload"
echo "   • Backend changes will auto-reload"
echo ""
echo "📋 Development Commands:"
echo "   • View logs:           docker-compose logs -f [service]"
echo "   • Restart service:     docker-compose restart [service]"
echo "   • Stop all:            docker-compose down"
echo ""
echo "💡 Tip: Use 'docker-compose logs -f frontend' to see frontend logs"
echo "💡 Tip: Use 'docker-compose logs -f backend' to see backend logs"
echo ""
