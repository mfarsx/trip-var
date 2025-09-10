#!/bin/bash

# TripVar Systemd Service Installation Script
# This script installs TripVar as a systemd service for auto-startup

set -e

# Configuration
SERVICE_NAME="tripvar"
SERVICE_FILE="tripvar.service"
PROJECT_DIR="/opt/tripvar"
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$CURRENT_DIR")"

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

    # Check if systemd is available
    if ! command -v systemctl &> /dev/null; then
        error "systemd is not available on this system"
    fi

    success "Prerequisites check passed"
}

# Create project directory
create_project_directory() {
    log "Creating project directory: $PROJECT_DIR"

    # Create directory if it doesn't exist
    mkdir -p "$PROJECT_DIR"

    # Copy project files
    log "Copying project files to $PROJECT_DIR"
    cp -r "$PROJECT_ROOT"/* "$PROJECT_DIR/"

    # Set proper ownership
    chown -R root:root "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"

    # Make scripts executable
    chmod +x "$PROJECT_DIR/scripts"/*.sh

    success "Project directory created"
}

# Install systemd service
install_service() {
    log "Installing systemd service..."

    # Copy service file
    cp "$PROJECT_ROOT/scripts/$SERVICE_FILE" "/etc/systemd/system/"

    # Update service file with correct paths
    sed -i "s|/opt/tripvar|$PROJECT_DIR|g" "/etc/systemd/system/$SERVICE_FILE"

    # Reload systemd
    systemctl daemon-reload

    # Enable service
    systemctl enable "$SERVICE_NAME"

    success "Systemd service installed and enabled"
}

# Create log rotation configuration
setup_log_rotation() {
    log "Setting up log rotation..."

    cat > "/etc/logrotate.d/$SERVICE_NAME" << EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload $SERVICE_NAME > /dev/null 2>&1 || true
    endscript
}
EOF

    success "Log rotation configured"
}

# Create monitoring script
create_monitoring_script() {
    log "Creating monitoring script..."

    cat > "$PROJECT_DIR/scripts/monitor.sh" << 'EOF'
#!/bin/bash

# TripVar Monitoring Script
PROJECT_DIR="/opt/tripvar"
LOG_FILE="$PROJECT_DIR/logs/monitor.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if service is running
if ! systemctl is-active --quiet tripvar; then
    log "ERROR: TripVar service is not running, attempting to restart..."
    systemctl restart tripvar
    sleep 10
    
    if systemctl is-active --quiet tripvar; then
        log "SUCCESS: TripVar service restarted successfully"
    else
        log "ERROR: Failed to restart TripVar service"
        exit 1
    fi
fi

# Check Docker containers
cd "$PROJECT_DIR"
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "ERROR: Some Docker containers are not running"
    docker-compose -f docker-compose.prod.yml ps
    exit 1
fi

# Check API health
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    log "ERROR: API health check failed"
    exit 1
fi

log "SUCCESS: All health checks passed"
EOF

    chmod +x "$PROJECT_DIR/scripts/monitor.sh"

    # Add to crontab for monitoring every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_DIR/scripts/monitor.sh") | crontab -

    success "Monitoring script created"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."

    cat > "$PROJECT_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash

# TripVar Backup Script
PROJECT_DIR="/opt/tripvar"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tripvar_backup_$TIMESTAMP.tar.gz"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting backup process..."

# Create backup
cd "$PROJECT_DIR"
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='backups' \
    --exclude='uploads' \
    .

# Backup database volumes
if docker volume ls | grep -q "tripvar_mongodb_data"; then
    log "Backing up MongoDB data..."
    docker run --rm \
        -v tripvar_mongodb_data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar czf "/backup/mongodb_backup_$TIMESTAMP.tar.gz" -C /data .
fi

if docker volume ls | grep -q "tripvar_redis_data"; then
    log "Backing up Redis data..."
    docker run --rm \
        -v tripvar_redis_data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar czf "/backup/redis_backup_$TIMESTAMP.tar.gz" -C /data .
fi

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "tripvar_backup_*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "mongodb_backup_*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "redis_backup_*.tar.gz" -mtime +7 -delete

log "Backup completed: $BACKUP_FILE"
EOF

    chmod +x "$PROJECT_DIR/scripts/backup.sh"

    # Add to crontab for daily backups at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/scripts/backup.sh") | crontab -

    success "Backup script created"
}

# Create firewall rules
setup_firewall() {
    log "Setting up firewall rules..."

    # Check if ufw is available
    if command -v ufw &> /dev/null; then
        # Allow SSH
        ufw allow 22/tcp
        
        # Allow HTTP and HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Enable firewall if not already enabled
        ufw --force enable
        
        success "Firewall rules configured"
    else
        warning "ufw not available, skipping firewall configuration"
    fi
}

# Start the service
start_service() {
    log "Starting TripVar service..."

    systemctl start "$SERVICE_NAME"
    
    # Wait a moment for services to start
    sleep 10
    
    # Check service status
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        success "TripVar service started successfully"
    else
        error "Failed to start TripVar service"
    fi
}

# Show service status
show_status() {
    log "Service Status:"
    systemctl status "$SERVICE_NAME" --no-pager
    
    log "Service Logs (last 20 lines):"
    journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    
    log "Docker Containers:"
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.prod.yml ps
}

# Main function
main() {
    log "Installing TripVar as a systemd service..."

    check_root
    check_prerequisites
    create_project_directory
    install_service
    setup_log_rotation
    create_monitoring_script
    create_backup_script
    setup_firewall
    start_service
    show_status

    success "TripVar service installation completed!"
    log ""
    log "Service management commands:"
    log "  Start:   sudo systemctl start $SERVICE_NAME"
    log "  Stop:    sudo systemctl stop $SERVICE_NAME"
    log "  Restart: sudo systemctl restart $SERVICE_NAME"
    log "  Status:  sudo systemctl status $SERVICE_NAME"
    log "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
    log ""
    log "The service will automatically start on boot."
}

# Run main function
main "$@"