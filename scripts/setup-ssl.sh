#!/bin/bash

# TripVar SSL Certificate Setup Script for Raspberry Pi 5
# This script sets up SSL certificates using Let's Encrypt

set -e

# Configuration
DOMAIN=""
EMAIL=""
STAGING=false
FORCE_RENEWAL=false
NGINX_CONTAINER="tripvar-nginx-prod"
CERTBOT_WEBROOT="/var/www/certbot"

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
    echo "  -f, --force             Force certificate renewal"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -d example.com -e admin@example.com"
    echo "  $0 -d example.com -e admin@example.com --staging"
    echo "  $0 -d example.com -e admin@example.com --force"
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
            -f|--force)
                FORCE_RENEWAL=true
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
    if [[ -z "$DOMAIN" ]]; then
        error "Domain is required. Use -d or --domain option."
    fi

    if [[ -z "$EMAIL" ]]; then
        error "Email is required. Use -e or --email option."
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi

    # Check if certbot is available
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        apt-get update
        apt-get install -y certbot
    fi

    success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."

    mkdir -p ./ssl
    mkdir -p ./logs/nginx
    mkdir -p ./logs/certbot
    mkdir -p ./www/certbot

    success "Directories created"
}

# Update Nginx configuration with domain
update_nginx_config() {
    log "Updating Nginx configuration with domain: $DOMAIN"

    # Create a temporary nginx config with the actual domain
    sed "s/yourdomain.com/$DOMAIN/g" ./nginx/nginx.prod.conf > ./nginx/nginx.prod.tmp.conf

    success "Nginx configuration updated"
}

# Start temporary Nginx for certificate generation
start_temp_nginx() {
    log "Starting temporary Nginx for certificate generation..."

    # Create a minimal nginx config for certificate generation
    cat > ./nginx/nginx.temp.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'Certificate generation in progress...';
            add_header Content-Type text/plain;
        }
    }
}
EOF

    # Start temporary nginx container
    docker run -d \
        --name temp-nginx \
        -p 80:80 \
        -v "$(pwd)/nginx/nginx.temp.conf:/etc/nginx/nginx.conf:ro" \
        -v "$(pwd)/www/certbot:/var/www/certbot:ro" \
        nginx:alpine

    # Wait for nginx to start
    sleep 5

    success "Temporary Nginx started"
}

# Generate SSL certificate
generate_certificate() {
    log "Generating SSL certificate for domain: $DOMAIN"

    # Prepare certbot command
    CERTBOT_CMD="certbot certonly --webroot -w $(pwd)/www/certbot"
    CERTBOT_CMD="$CERTBOT_CMD -d $DOMAIN"
    CERTBOT_CMD="$CERTBOT_CMD -d www.$DOMAIN"
    CERTBOT_CMD="$CERTBOT_CMD --email $EMAIL"
    CERTBOT_CMD="$CERTBOT_CMD --agree-tos"
    CERTBOT_CMD="$CERTBOT_CMD --non-interactive"

    if [[ "$STAGING" == true ]]; then
        CERTBOT_CMD="$CERTBOT_CMD --staging"
        log "Using Let's Encrypt staging environment"
    fi

    if [[ "$FORCE_RENEWAL" == true ]]; then
        CERTBOT_CMD="$CERTBOT_CMD --force-renewal"
        log "Forcing certificate renewal"
    fi

    # Generate certificate
    if eval "$CERTBOT_CMD"; then
        success "SSL certificate generated successfully"
    else
        error "Failed to generate SSL certificate"
    fi
}

# Copy certificates to project directory
copy_certificates() {
    log "Copying certificates to project directory..."

    # Determine certificate path
    if [[ "$STAGING" == true ]]; then
        CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    else
        CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    fi

    # Copy certificates
    cp "$CERT_PATH/fullchain.pem" ./ssl/cert.pem
    cp "$CERT_PATH/privkey.pem" ./ssl/key.pem

    # Set proper permissions
    chmod 644 ./ssl/cert.pem
    chmod 600 ./ssl/key.pem

    success "Certificates copied to project directory"
}

# Stop temporary Nginx
stop_temp_nginx() {
    log "Stopping temporary Nginx..."

    docker stop temp-nginx || true
    docker rm temp-nginx || true

    success "Temporary Nginx stopped"
}

# Update production Nginx configuration
update_production_nginx() {
    log "Updating production Nginx configuration..."

    # Move the temporary config to production
    mv ./nginx/nginx.prod.tmp.conf ./nginx/nginx.prod.conf

    success "Production Nginx configuration updated"
}

# Setup certificate auto-renewal
setup_auto_renewal() {
    log "Setting up certificate auto-renewal..."

    # Create renewal script
    cat > ./scripts/renew-ssl.sh << 'EOF'
#!/bin/bash

# SSL Certificate Renewal Script
set -e

PROJECT_DIR="/opt/tripvar"
DOMAIN="YOUR_DOMAIN_HERE"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting SSL certificate renewal check..."

# Check if certificate needs renewal (expires in 30 days)
if certbot certificates -d $DOMAIN | grep -q "VALID: 30 days"; then
    log "Certificate expires in 30 days, renewing..."
    
    # Renew certificate
    certbot renew --quiet
    
    # Copy new certificates
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $PROJECT_DIR/ssl/cert.pem
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $PROJECT_DIR/ssl/key.pem
    
    # Reload nginx
    docker-compose -f $PROJECT_DIR/docker-compose.prod.yml exec nginx nginx -s reload
    
    log "Certificate renewed successfully"
else
    log "Certificate is still valid, no renewal needed"
fi
EOF

    # Replace placeholder with actual domain
    sed -i "s/YOUR_DOMAIN_HERE/$DOMAIN/g" ./scripts/renew-ssl.sh

    # Make script executable
    chmod +x ./scripts/renew-ssl.sh

    # Add to crontab for monthly renewal check
    (crontab -l 2>/dev/null; echo "0 2 1 * * $PROJECT_DIR/scripts/renew-ssl.sh >> $PROJECT_DIR/logs/ssl-renewal.log 2>&1") | crontab -

    success "Auto-renewal setup completed"
}

# Verify certificate
verify_certificate() {
    log "Verifying SSL certificate..."

    # Check if certificate files exist
    if [[ ! -f "./ssl/cert.pem" ]] || [[ ! -f "./ssl/key.pem" ]]; then
        error "Certificate files not found"
    fi

    # Verify certificate content
    if ! openssl x509 -in ./ssl/cert.pem -text -noout > /dev/null 2>&1; then
        error "Invalid certificate file"
    fi

    # Check certificate expiration
    EXPIRY_DATE=$(openssl x509 -in ./ssl/cert.pem -enddate -noout | cut -d= -f2)
    log "Certificate expires on: $EXPIRY_DATE"

    success "SSL certificate verification passed"
}

# Main function
main() {
    log "Starting SSL certificate setup for domain: $DOMAIN"

    check_prerequisites
    create_directories
    update_nginx_config
    start_temp_nginx
    generate_certificate
    copy_certificates
    stop_temp_nginx
    update_production_nginx
    setup_auto_renewal
    verify_certificate

    success "SSL certificate setup completed successfully!"
    log "You can now start your production deployment with:"
    log "  docker-compose -f docker-compose.prod.yml up -d"
}

# Parse arguments and run main function
parse_args "$@"
main