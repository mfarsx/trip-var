#!/bin/bash

# TripVar Production Deployment Script
# This script handles the complete deployment process for the TripVar application

set -e  # Exit on any error

# Configuration
PROJECT_NAME="tripvar"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if required files exist
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file $DOCKER_COMPOSE_FILE not found"
    fi
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found"
    fi
    
    success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./logs"
    mkdir -p "./ssl"
    mkdir -p "./uploads"
    
    success "Directories created"
}

# Backup existing data
backup_data() {
    log "Creating backup of existing data..."
    
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database volumes
    if docker volume ls | grep -q "tripvar_mongodb_data"; then
        log "Backing up MongoDB data..."
        docker run --rm -v tripvar_mongodb_data:/data -v "$(pwd)/$BACKUP_PATH":/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .
    fi
    
    # Backup Redis data
    if docker volume ls | grep -q "tripvar_redis_data"; then
        log "Backing up Redis data..."
        docker run --rm -v tripvar_redis_data:/data -v "$(pwd)/$BACKUP_PATH":/backup alpine tar czf /backup/redis_backup.tar.gz -C /data .
    fi
    
    # Backup logs
    if [[ -d "./logs" ]]; then
        log "Backing up logs..."
        tar czf "$BACKUP_PATH/logs_backup.tar.gz" -C ./logs .
    fi
    
    success "Backup created at $BACKUP_PATH"
}

# Validate environment variables
validate_env() {
    log "Validating environment variables..."
    
    # Source the environment file
    set -a
    source "$ENV_FILE"
    set +a
    
    # Check required variables
    REQUIRED_VARS=(
        "JWT_SECRET"
        "MONGO_PASSWORD"
        "REDIS_PASSWORD"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    # Validate JWT secret strength
    if [[ ${#JWT_SECRET} -lt 32 ]]; then
        error "JWT_SECRET must be at least 32 characters long"
    fi
    
    success "Environment validation passed"
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Build custom images
    log "Building custom images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check if containers are running
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        error "Some containers failed to start"
    fi
    
    # Check API health
    log "Checking API health..."
    for i in {1..10}; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            success "API health check passed"
            break
        fi
        
        if [[ $i -eq 10 ]]; then
            error "API health check failed after 10 attempts"
        fi
        
        log "Health check attempt $i failed, retrying in 10 seconds..."
        sleep 10
    done
    
    # Check frontend
    log "Checking frontend..."
    for i in {1..5}; do
        if curl -f http://localhost:80 > /dev/null 2>&1; then
            success "Frontend health check passed"
            break
        fi
        
        if [[ $i -eq 5 ]]; then
            warning "Frontend health check failed"
        fi
        
        sleep 5
    done
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Find the most recent backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [[ -z "$LATEST_BACKUP" ]]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back using backup: $LATEST_BACKUP"
    
    # Restore database
    if [[ -f "$BACKUP_DIR/$LATEST_BACKUP/mongodb_backup.tar.gz" ]]; then
        log "Restoring MongoDB data..."
        docker run --rm -v tripvar_mongodb_data:/data -v "$(pwd)/$BACKUP_DIR/$LATEST_BACKUP":/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
    fi
    
    # Restore Redis
    if [[ -f "$BACKUP_DIR/$LATEST_BACKUP/redis_backup.tar.gz" ]]; then
        log "Restoring Redis data..."
        docker run --rm -v tripvar_redis_data:/data -v "$(pwd)/$BACKUP_DIR/$LATEST_BACKUP":/backup alpine tar xzf /backup/redis_backup.tar.gz -C /data
    fi
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Rollback completed"
}

# Main deployment function
main() {
    log "Starting TripVar deployment process..."
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_root
            check_prerequisites
            create_directories
            validate_env
            backup_data
            deploy
            health_check
            cleanup
            success "Deployment completed successfully!"
            ;;
        "rollback")
            check_root
            rollback
            health_check
            success "Rollback completed successfully!"
            ;;
        "health")
            health_check
            ;;
        "backup")
            check_root
            backup_data
            success "Backup completed successfully!"
            ;;
        "cleanup")
            check_root
            cleanup
            success "Cleanup completed successfully!"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup|cleanup}"
            echo "  deploy  - Full deployment process (default)"
            echo "  rollback - Rollback to previous version"
            echo "  health  - Perform health checks"
            echo "  backup  - Create backup only"
            echo "  cleanup - Clean up Docker resources"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"