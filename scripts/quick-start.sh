#!/bin/bash

# TripVar Quick Start Script for Raspberry Pi 5
# Simplified deployment for testing and development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Install Docker if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $SUDO_USER
        rm get-docker.sh
        success "Docker installed"
    else
        log "Docker already installed"
    fi
}

# Install Docker Compose if not present
install_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        apt-get update
        apt-get install -y docker-compose-plugin
        success "Docker Compose installed"
    else
        log "Docker Compose already installed"
    fi
}

# Setup basic environment
setup_environment() {
    log "Setting up basic environment..."

    # Generate secure passwords
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

    # Create production environment files if they don't exist
    if [[ ! -f "tripvar-server/.env.prod" ]]; then
        cp tripvar-server/.env.prod tripvar-server/.env.prod.backup 2>/dev/null || true
        cp tripvar-server/.env.example tripvar-server/.env.prod 2>/dev/null || true
    fi

    if [[ ! -f "tripvar-client/.env.prod" ]]; then
        cp tripvar-client/.env.prod tripvar-client/.env.prod.backup 2>/dev/null || true
        cp tripvar-client/.env.example tripvar-client/.env.prod 2>/dev/null || true
    fi

    # Update passwords in server environment
    sed -i "s/CHANGE_THIS_PASSWORD/$MONGO_PASSWORD/g" tripvar-server/.env.prod
    sed -i "s/CHANGE_THIS_REDIS_PASSWORD/$REDIS_PASSWORD/g" tripvar-server/.env.prod
    sed -i "s/CHANGE_THIS_TO_A_64_CHARACTER_SECRET_KEY_HERE/$JWT_SECRET/g" tripvar-server/.env.prod

    # Set localhost URLs for quick start
    sed -i "s/yourdomain.com/localhost/g" tripvar-server/.env.prod
    sed -i "s/yourdomain.com/localhost/g" tripvar-client/.env.prod

    success "Environment configured for localhost access"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."

    mkdir -p logs ssl uploads backups

    success "Directories created"
}

# Start services
start_services() {
    log "Starting TripVar services..."

    # Stop any existing containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true

    # Build and start services
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for services to start
    log "Waiting for services to start..."
    sleep 30

    success "Services started"
}

# Check service status
check_status() {
    log "Checking service status..."

    # Check if containers are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        success "All services are running"
    else
        error "Some services failed to start"
    fi

    # Show container status
    docker-compose -f docker-compose.prod.yml ps
}

# Test endpoints
test_endpoints() {
    log "Testing endpoints..."

    # Wait a bit more for services to fully start
    sleep 30

    # Test API health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        success "API health check passed"
    else
        warning "API health check failed"
    fi

    # Test frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend is accessible"
    else
        warning "Frontend health check failed"
    fi
}

# Show access information
show_access_info() {
    log "=== ACCESS INFORMATION ==="
    log ""
    log "Frontend: http://localhost:3000"
    log "API: http://localhost:8000"
    log "API Health: http://localhost:8000/health"
    log "API Docs: http://localhost:8000/api-docs"
    log ""
    log "Database Access:"
    log "  MongoDB: localhost:27017"
    log "  Redis: localhost:6379"
    log ""
    log "Management Commands:"
    log "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
    log "  Stop services: docker-compose -f docker-compose.prod.yml down"
    log "  Restart services: docker-compose -f docker-compose.prod.yml restart"
    log "  Check status: docker-compose -f docker-compose.prod.yml ps"
    log ""
    log "For production deployment with SSL, run:"
    log "  sudo ./scripts/deploy-raspberry-pi.sh -d yourdomain.com -e your-email@example.com"
    log ""
    log "=== QUICK START COMPLETED ==="
}

# Main function
main() {
    log "Starting TripVar Quick Start for Raspberry Pi 5..."

    check_root
    install_docker
    install_docker_compose
    setup_environment
    create_directories
    start_services
    check_status
    test_endpoints
    show_access_info

    success "TripVar Quick Start completed!"
    log ""
    log "Your TripVar application is now running locally on your Raspberry Pi 5!"
    log "Open http://localhost:3000 in your browser to access the application."
}

# Run main function
main "$@"