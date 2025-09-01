#!/bin/bash

# Docker setup script for TripVar
# This script helps set up the Docker environment for development and production

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Function to create environment files if they don't exist
create_env_files() {
    print_status "Checking environment files..."
    
    # Server environment files
    if [ ! -f "./tripvar-server/.env" ]; then
        print_warning "Creating tripvar-server/.env from example..."
        cp ./tripvar-server/.env.example ./tripvar-server/.env
    fi
    
    if [ ! -f "./tripvar-server/.env.prod" ]; then
        print_warning "Creating tripvar-server/.env.prod from example..."
        cp ./tripvar-server/.env.example ./tripvar-server/.env.prod
        # Update for production
        sed -i.bak 's/NODE_ENV=development/NODE_ENV=production/' ./tripvar-server/.env.prod
        rm ./tripvar-server/.env.prod.bak
    fi
    
    # Client environment files
    if [ ! -f "./tripvar-client/.env" ]; then
        print_warning "Creating tripvar-client/.env from example..."
        cp ./tripvar-client/.env.example ./tripvar-client/.env
    fi
    
    if [ ! -f "./tripvar-client/.env.prod" ]; then
        print_warning "Creating tripvar-client/.env.prod from example..."
        cp ./tripvar-client/.env.example ./tripvar-client/.env.prod
        # Update for production
        sed -i.bak 's/NODE_ENV=development/NODE_ENV=production/' ./tripvar-client/.env.prod
        rm ./tripvar-client/.env.prod.bak
    fi
    
    print_success "Environment files are ready"
}

# Function to generate SSL certificates
generate_ssl() {
    print_status "Checking SSL certificates..."
    
    if [ ! -f "./ssl/cert.pem" ] || [ ! -f "./ssl/key.pem" ]; then
        print_warning "SSL certificates not found. Generating self-signed certificates..."
        ./scripts/generate-ssl.sh
    else
        print_success "SSL certificates already exist"
    fi
}

# Function to build and start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Stop any existing containers
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Client: http://localhost:5173"
    echo "  - Server: http://localhost:8000"
    echo "  - MongoDB: localhost:27017"
    echo "  - Redis: localhost:6379"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up --build -d
    
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  - Application: https://localhost (or your domain)"
    echo "  - API: https://localhost/api"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    
    print_success "All services stopped"
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose down -v
    docker-compose -f docker-compose.prod.yml down -v
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "Docker cleanup completed"
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Function to show status
show_status() {
    print_status "Docker services status:"
    docker-compose ps
}

# Main script logic
case "${1:-help}" in
    "dev"|"development")
        check_docker
        check_docker_compose
        create_env_files
        start_dev
        ;;
    "prod"|"production")
        check_docker
        check_docker_compose
        create_env_files
        generate_ssl
        start_prod
        ;;
    "stop")
        stop_all
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        echo "TripVar Docker Setup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  dev, development    Start development environment"
        echo "  prod, production    Start production environment"
        echo "  stop                Stop all services"
        echo "  cleanup             Clean up Docker resources"
        echo "  logs [service]      Show logs (optionally for specific service)"
        echo "  status              Show services status"
        echo "  help                Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 dev              # Start development environment"
        echo "  $0 prod             # Start production environment"
        echo "  $0 logs server      # Show server logs"
        echo "  $0 status           # Show services status"
        ;;
esac