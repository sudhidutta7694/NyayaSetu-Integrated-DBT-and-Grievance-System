#!/bin/bash

# NyayaSetu DBT System Startup Script
# This script sets up and starts the complete NyayaSetu system

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    local port=$1
    if nc -z localhost $port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_warning "Cleaning up..."
    # Add any cleanup tasks here if needed
}

# Set trap for cleanup on script exit
trap cleanup EXIT

# Main script starts here
echo "=========================================="
echo "🚀 NyayaSetu DBT System Startup Script"
echo "=========================================="
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is installed
if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed (try both versions)
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set the compose command to use
if command_exists docker-compose; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

print_status "Using Docker Compose command: $COMPOSE_CMD"

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

print_success "All prerequisites are met!"

# Check if ports are available
print_status "Checking port availability..."

PORTS=(3000 8000 5433 6380)
for port in "${PORTS[@]}"; do
    if check_port $port; then
        print_warning "Port $port is already in use. This might cause conflicts."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Aborting startup. Please free up port $port and try again."
            exit 1
        fi
    fi
done

print_success "Ports are available!"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p backend/uploads
mkdir -p frontend/.next

# Stop any existing containers
print_status "Stopping any existing containers..."
$COMPOSE_CMD down --remove-orphans >/dev/null 2>&1 || true

# Build and start services
print_status "Building and starting services..."

# Build backend
print_status "Building backend service..."
$COMPOSE_CMD build backend

# Build frontend
print_status "Building frontend service..."
$COMPOSE_CMD build frontend

# Start database services first
print_status "Starting database services (PostgreSQL and Redis)..."
$COMPOSE_CMD up -d postgres redis

# Wait for PostgreSQL to be ready
wait_for_service "PostgreSQL" 5433

# Wait for Redis to be ready
wait_for_service "Redis" 6380

# Start backend service (migrations will be handled by the backend startup script)
print_status "Starting backend service..."
$COMPOSE_CMD up -d backend

# Wait for backend to be ready
wait_for_service "Backend API" 8000

# Start frontend service
print_status "Starting frontend service..."
$COMPOSE_CMD up -d frontend

# Wait for frontend to be ready
wait_for_service "Frontend" 3000

# Start nginx (optional)
print_status "Starting Nginx reverse proxy..."
$COMPOSE_CMD up -d nginx

# Wait for nginx to be ready
wait_for_service "Nginx" 80

# Health check
print_status "Performing health checks..."

# Check backend health
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed, but service might still be starting"
fi

# Check frontend health
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    print_success "Frontend health check passed"
else
    print_warning "Frontend health check failed, but service might still be starting"
fi

# Display service information
echo ""
echo "=========================================="
echo "🎉 NyayaSetu DBT System is now running!"
echo "=========================================="
echo ""
echo "📱 Frontend (Next.js):     http://localhost:3000"
echo "🔧 Backend API (FastAPI):  http://localhost:8000"
echo "📚 API Documentation:      http://localhost:8000/docs"
echo "🗄️  PostgreSQL Database:   localhost:5433"
echo "📦 Redis Cache:            localhost:6380"
echo "🌐 Nginx Proxy:            http://localhost:80"
echo ""
echo "📋 Available Services:"
echo "   • User Registration & Login"
echo "   • Aadhaar-based OTP Authentication"
echo "   • Multi-step Onboarding Process"
echo "   • Document Upload & Verification"
echo "   • Bank Account Management"
echo "   • Case Registration & Tracking"
echo "   • Admin Dashboard"
echo "   • Multi-language Support (Hindi/English)"
echo "   • Accessibility Features"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs:           docker-compose logs -f [service]"
echo "   • Stop services:       docker-compose down"
echo "   • Restart service:     docker-compose restart [service]"
echo "   • View status:         docker-compose ps"
echo ""
echo "📖 For more information, check the README.md file"
echo ""

# Create a simple status check script
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "🔍 NyayaSetu System Status Check"
echo "================================="
echo ""

# Check Docker containers
echo "📦 Docker Containers:"
$COMPOSE_CMD ps
echo ""

# Check service health
echo "🏥 Service Health:"
echo -n "Frontend (3000): "
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "Backend (8000):  "
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "PostgreSQL (5433): "
if nc -z localhost 5433 >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "Redis (6380):    "
if nc -z localhost 6380 >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi
EOF

chmod +x check-status.sh

print_success "Status check script created: ./check-status.sh"

# Create a stop script
cat > stop.sh << EOF
#!/bin/bash
echo "🛑 Stopping NyayaSetu DBT System..."
$COMPOSE_CMD down
echo "✅ All services stopped"
EOF

chmod +x stop.sh

print_success "Stop script created: ./stop.sh"

# Create a restart script
cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting NyayaSetu DBT System..."
./stop.sh
sleep 2
./start.sh
EOF

chmod +x restart.sh

print_success "Restart script created: ./restart.sh"

echo ""
print_success "🎉 Setup complete! You can now access the NyayaSetu system."
print_status "Run './check-status.sh' to verify all services are running properly."
print_status "Run './stop.sh' to stop all services when done."
