#!/bin/bash

# TripVar Production Setup Script
# This script helps you set up the production environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║         TripVar Production Setup Wizard                 ║
║     Preparing your application for deployment           ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/"
}

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 1: Domain Configuration${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Use default domain (will be updated later in nginx config)
DOMAIN="yourdomain.com"
WWW_DOMAIN="www.yourdomain.com"
echo -e "${YELLOW}Using default domain: $DOMAIN${NC}"
echo -e "${YELLOW}You can update this later in nginx/nginx.prod.conf${NC}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 2: Database Configuration${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Generating secure database passwords...${NC}"
MONGO_ADMIN_PASSWORD=$(generate_password)
MONGO_USER_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
echo -e "${GREEN}✓ Database passwords generated${NC}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 3: Security Configuration${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Generating JWT secret...${NC}"
JWT_SECRET=$(generate_jwt_secret)
echo -e "${GREEN}✓ JWT secret generated (length: ${#JWT_SECRET})${NC}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 4: Creating Environment Files${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create root .env.prod
cat > .env.prod << EOF
# TripVar - Root Production Environment Variables
# Generated on $(date)
# IMPORTANT: Never commit this file to version control!

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=$MONGO_ADMIN_PASSWORD
MONGO_USERNAME=tripvar_user
MONGO_PASSWORD=$MONGO_USER_PASSWORD

REDIS_PASSWORD=$REDIS_PASSWORD

DOMAIN=$DOMAIN
WWW_DOMAIN=$WWW_DOMAIN
EOF
echo -e "${GREEN}✓ Created .env.prod${NC}"

# Create server .env.prod
cat > tripvar-server/.env.prod << EOF
# TripVar Server - Production Environment Variables
# Generated on $(date)

NODE_ENV=production
HOST=0.0.0.0
PORT=8000

# Database
MONGODB_URI=mongodb://tripvar_user:$MONGO_USER_PASSWORD@mongodb:27017/tripvar?authSource=admin
DB_MAX_POOL_SIZE=10
DB_SERVER_SELECTION_TIMEOUT=5000
DB_SOCKET_TIMEOUT=45000

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
JWT_ISSUER=tripvar
JWT_AUDIENCE=tripvar-users

# Security
ALLOWED_ORIGINS=https://$DOMAIN,https://$WWW_DOMAIN
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/usr/src/app/logs
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14
LOG_DATE_PATTERN=YYYY-MM-DD

# SSL
SSL_ENABLED=false

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/usr/src/app/uploads
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp

# External APIs
EXTERNAL_API_TIMEOUT=10000
EXTERNAL_API_RETRIES=3
EOF
echo -e "${GREEN}✓ Created tripvar-server/.env.prod${NC}"

# Create client .env.prod
cat > tripvar-client/.env.prod << EOF
# TripVar Client - Production Environment Variables
# Generated on $(date)

NODE_ENV=production

# API Configuration
VITE_API_URL=https://$DOMAIN/api
VITE_WS_URL=wss://$DOMAIN/ws

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=false

# Application Info
VITE_APP_NAME=TripVar
VITE_APP_VERSION=1.0.0
EOF
echo -e "${GREEN}✓ Created tripvar-client/.env.prod${NC}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 5: Nginx Configuration${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Nginx configuration kept with default domain${NC}"
echo -e "${YELLOW}To use your own domain, update nginx/nginx.prod.conf manually${NC}"
echo -e "${GREEN}✓ Nginx configuration ready${NC}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 6: Create Necessary Directories${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p logs backups uploads ssl
echo -e "${GREEN}✓ Created logs/, backups/, uploads/, ssl/ directories${NC}"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 7: Set Proper Permissions${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

chmod 600 .env.prod tripvar-server/.env.prod tripvar-client/.env.prod
chmod +x scripts/*.sh
echo -e "${GREEN}✓ Set secure permissions${NC}"

echo
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                  Setup Complete! ✓                       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${YELLOW}📝 Important Security Notes:${NC}"
echo -e "  ${RED}•${NC} Keep your .env.prod files secure - they contain sensitive credentials"
echo -e "  ${RED}•${NC} Never commit .env.prod files to version control"
echo -e "  ${RED}•${NC} Store passwords securely in a password manager"
echo
echo -e "${YELLOW}🔑 Generated Credentials (SAVE THESE SECURELY):${NC}"
echo -e "  ${CYAN}MongoDB Admin:${NC} admin / $MONGO_ADMIN_PASSWORD"
echo -e "  ${CYAN}MongoDB User:${NC} tripvar_user / $MONGO_USER_PASSWORD"
echo -e "  ${CYAN}Redis Password:${NC} $REDIS_PASSWORD"
echo -e "  ${CYAN}JWT Secret Length:${NC} ${#JWT_SECRET} characters"
echo
echo -e "${YELLOW}🌐 Domain Configuration:${NC}"
echo -e "  If deploying to a custom domain:"
echo -e "  1. Update domain in: ${CYAN}nginx/nginx.prod.conf${NC}"
echo -e "  2. Update domain in: ${CYAN}tripvar-server/.env.prod${NC} (ALLOWED_ORIGINS)"
echo -e "  3. Update domain in: ${CYAN}tripvar-client/.env.prod${NC} (VITE_API_URL)"
echo
echo -e "${YELLOW}🔐 Next Steps for SSL/HTTPS:${NC}"
echo -e "  1. Generate SSL certificates:"
echo -e "     ${CYAN}bash scripts/generate-ssl.sh${NC}"
echo -e "  2. Or set up Let's Encrypt (recommended for production):"
echo -e "     ${CYAN}sudo bash scripts/setup-ssl.sh -d yourdomain.com -e admin@yourdomain.com${NC}"
echo
echo -e "${YELLOW}🚀 To deploy your application:${NC}"
echo -e "  ${CYAN}bash scripts/deploy.sh${NC}"
echo
echo -e "${YELLOW}📊 To monitor your application:${NC}"
echo -e "  ${CYAN}bash scripts/show-status.sh${NC}"
echo -e "  ${CYAN}bash scripts/health-check.sh${NC}"
echo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

