#!/bin/bash

# TripVar Raspberry Pi 5 Complete Deployment Script
# This script automates the entire deployment process

set -e

# Configuration
PROJECT_NAME="tripvar"
DOMAIN=""
EMAIL=""
STAGING=false
SKIP_SSL=false
INSTALL_SERVICE=true
START_MONITORING=true

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

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --domain DOMAIN     Domain name for SSL certificate (required)"
    echo "  -e, --email EMAIL       Email address for Let's Encrypt (required)"
    echo "  -s, --staging           Use Let's Encrypt staging environment"
    echo "  --skip-ssl              Skip SSL certificate setup"
    echo "  --no-service            Don't install as systemd service"
    echo "  --no-monitoring         Don't start monitoring"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -d example.com -e admin@example.com"
    echo "  $0 -d example.com -e admin@example.com --staging"
    echo "  $0 -d example.com -e admin@example.com --skip-ssl"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--domain)
                DOMAIN="$2"
                shift 2
                ;;
            -e|--email)
                EMAIL="$2"
                shift 2
                ;;
            -s|--staging)
                STAGING=true
                shift
                ;;
            --skip-ssl)
                SKIP_SSL=true
                shift
                ;;
            --no-service)
                INSTALL_SERVICE=false
                shift
                ;;
            --no-monitoring)
                START_MONITORING=false
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done

    # Validate required parameters
    if [[ -z "$DOMAIN" ]] && [[ "$SKIP_SSL" = false ]]; then
        error "Domain is required. Use -d or --domain option, or use --skip-ssl."
    fi

    if [[ -z "$EMAIL" ]] && [[ "$SKIP_SSL" = false ]]; then
        error "Email is required. Use -e or --email option, or use --skip-ssl."
    fi
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
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $SUDO_USER
        rm get-docker.sh
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        apt-get update
        apt-get install -y docker-compose-plugin
    fi

    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        log "Installing Git..."
        apt-get install -y git
    fi

    # Check if certbot is installed (for SSL)
    if [[ "$SKIP_SSL" = false ]] && ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        apt-get install -y certbot
    fi

    success "Prerequisites check completed"
}

# Update system packages
update_system() {
    log "Updating system packages..."

    apt-get update
    apt-get upgrade -y
    apt-get install -y curl wget vim htop ufw bc

    success "System packages updated"
}

# Configure environment files
configure_environment() {
    log "Configuring environment files..."

    # Generate secure passwords
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

    # Update server environment
    sed -i "s/CHANGE_THIS_PASSWORD/$MONGO_PASSWORD/g" tripvar-server/.env.prod
    sed -i "s/CHANGE_THIS_REDIS_PASSWORD/$REDIS_PASSWORD/g" tripvar-server/.env.prod
    sed -i "s/CHANGE_THIS_TO_A_64_CHARACTER_SECRET_KEY_HERE/$JWT_SECRET/g" tripvar-server/.env.prod

    if [[ -n "$DOMAIN" ]]; then
        sed -i "s/yourdomain.com/$DOMAIN/g" tripvar-server/.env.prod
        sed -i "s/yourdomain.com/$DOMAIN/g" tripvar-client/.env.prod
    fi

    success "Environment files configured"
}

# Setup SSL certificates
setup_ssl() {
    if [[ "$SKIP_SSL" = true ]]; then
        log "Skipping SSL certificate setup"
        return 0
    fi

    log "Setting up SSL certificates..."

    if [[ "$STAGING" = true ]]; then
        ./scripts/setup-ssl.sh -d "$DOMAIN" -e "$EMAIL" --staging
    else
        ./scripts/setup-ssl.sh -d "$DOMAIN" -e "$EMAIL"
    fi

    success "SSL certificates configured"
}

# Deploy application
deploy_application() {
    log "Deploying application..."

    # Create necessary directories
    mkdir -p logs ssl uploads backups

    # Build and start services
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for services to start
    log "Waiting for services to start..."
    sleep 30

    # Check if services are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        error "Some services failed to start"
    fi

    success "Application deployed successfully"
}

# Install systemd service
install_systemd_service() {
    if [[ "$INSTALL_SERVICE" = false ]]; then
        log "Skipping systemd service installation"
        return 0
    fi

    log "Installing systemd service..."

    ./scripts/install-service.sh

    success "Systemd service installed"
}

# Setup monitoring
setup_monitoring() {
    if [[ "$START_MONITORING" = false ]]; then
        log "Skipping monitoring setup"
        return 0
    fi

    log "Setting up monitoring..."

    # Create monitoring cron job
    (crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_DIR/scripts/health-check.sh >> $PROJECT_DIR/logs/health-check.log 2>&1") | crontab -

    # Start continuous monitoring in background
    nohup ./scripts/monitor-continuous.sh --interval 300 > logs/monitor-continuous.log 2>&1 &

    success "Monitoring setup completed"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."

    # Enable UFW
    ufw --force enable

    # Allow SSH
    ufw allow 22/tcp

    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp

    success "Firewall configured"
}

# Run health check
run_health_check() {
    log "Running initial health check..."

    # Wait a bit more for services to fully start
    sleep 60

    # Run health check
    if ./scripts/health-check.sh --once; then
        success "Initial health check passed"
    else
        warning "Initial health check completed with issues"
    fi
}

# Show deployment summary
show_summary() {
    log "=== DEPLOYMENT SUMMARY ==="
    log "Project: $PROJECT_NAME"
    log "Domain: ${DOMAIN:-'Not configured'}"
    log "SSL: $([ "$SKIP_SSL" = true ] && echo 'Disabled' || echo 'Enabled')"
    log "Service: $([ "$INSTALL_SERVICE" = true ] && echo 'Installed' || echo 'Not installed')"
    log "Monitoring: $([ "$START_MONITORING" = true ] && echo 'Enabled' || echo 'Disabled')"
    log ""
    log "Access URLs:"
    if [[ -n "$DOMAIN" ]]; then
        log "  Frontend: https://$DOMAIN"
        log "  API: https://$DOMAIN/api/v1"
        log "  Health: https://$DOMAIN/health"
    else
        log "  Frontend: http://localhost:3000"
        log "  API: http://localhost:8000/api/v1"
        log "  Health: http://localhost:8000/health"
    fi
    log ""
    log "Service Management:"
    log "  Status: sudo systemctl status tripvar"
    log "  Start:  sudo systemctl start tripvar"
    log "  Stop:   sudo systemctl stop tripvar"
    log "  Restart: sudo systemctl restart tripvar"
    log ""
    log "Logs:"
    log "  Service: sudo journalctl -u tripvar -f"
    log "  Application: tail -f logs/app.log"
    log "  Health: tail -f logs/health-check.log"
    log ""
    log "Monitoring:"
    log "  Health Check: ./scripts/health-check.sh"
    log "  Continuous: ./scripts/monitor-continuous.sh"
    log ""
    log "Backup:"
    log "  Manual: ./scripts/backup.sh"
    log "  Automatic: Daily at 2 AM"
    log ""
    log "=== DEPLOYMENT COMPLETED ==="
}

# Main deployment function
main() {
    log "Starting TripVar Raspberry Pi 5 deployment..."

    check_root
    parse_args "$@"
    check_prerequisites
    update_system
    configure_environment
    setup_ssl
    deploy_application
    install_systemd_service
    setup_monitoring
    configure_firewall
    run_health_check
    show_summary

    success "TripVar deployment completed successfully!"
    log ""
    log "Your TripVar application is now running on your Raspberry Pi 5!"
    log "Check the deployment summary above for access URLs and management commands."
}

# Run main function
main "$@"