# TripVar Raspberry Pi 5 Deployment Guide

This comprehensive guide will help you deploy your TripVar application on a Raspberry Pi 5 server with production-ready configuration, SSL certificates, and automated monitoring.

## 🍓 Prerequisites

### Hardware Requirements
- **Raspberry Pi 5** (4GB or 8GB RAM recommended)
- **MicroSD Card** (32GB+ Class 10 or better)
- **Power Supply** (Official Raspberry Pi 5 power supply recommended)
- **Ethernet Cable** (for initial setup)
- **Domain Name** (for SSL certificates)

### Software Requirements
- **Raspberry Pi OS** (64-bit recommended)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Initial Raspberry Pi Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git curl wget vim htop ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Reboot to apply changes
sudo reboot
```

### 2. Clone and Setup Project

```bash
# Clone your repository
git clone https://github.com/mfarsx/tripvar.git
cd tripvar

# Make scripts executable
chmod +x scripts/*.sh
```

### 3. Configure Environment

```bash
# Copy and edit production environment files
cp tripvar-server/.env.prod tripvar-server/.env.prod.backup
cp tripvar-client/.env.prod tripvar-client/.env.prod.backup

# Edit server environment
nano tripvar-server/.env.prod
```

**Update these critical values in `tripvar-server/.env.prod`:**
```bash
# Change these passwords to secure values
MONGO_PASSWORD=your_secure_mongodb_password_here
REDIS_PASSWORD=your_secure_redis_password_here
JWT_SECRET=your_64_character_jwt_secret_key_here

# Update domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Update client environment:**
```bash
nano tripvar-client/.env.prod
```

```bash
# Update with your domain
VITE_API_URL=https://yourdomain.com
VITE_WS_URL=wss://yourdomain.com
```

### 4. Setup SSL Certificates

```bash
# Run SSL setup script
sudo ./scripts/setup-ssl.sh -d yourdomain.com -e your-email@example.com

# For testing, use staging environment first
sudo ./scripts/setup-ssl.sh -d yourdomain.com -e your-email@example.com --staging
```

### 5. Deploy Application

```bash
# Install as systemd service
sudo ./scripts/install-service.sh
```

## 🔧 Detailed Configuration

### Domain and DNS Setup

1. **Purchase a domain** (e.g., from Namecheap, GoDaddy, etc.)
2. **Configure DNS records:**
   ```
   A Record: yourdomain.com → YOUR_PI_IP_ADDRESS
   A Record: www.yourdomain.com → YOUR_PI_IP_ADDRESS
   ```

3. **Find your Pi's IP address:**
   ```bash
   ip addr show | grep inet
   ```

### Environment Configuration

#### Server Environment (`tripvar-server/.env.prod`)

```bash
# Server Configuration
NODE_ENV=production
PORT=8000
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://tripvar_user:YOUR_SECURE_PASSWORD@mongodb:27017/tripvar?authSource=admin
MONGO_PASSWORD=YOUR_SECURE_PASSWORD

# Redis Configuration
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis:6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=YOUR_64_CHARACTER_JWT_SECRET_KEY_HERE
JWT_EXPIRES_IN=7d

# Security Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# SSL Configuration
SSL_ENABLED=true
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=/usr/src/app/logs/app.log

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/usr/src/app/uploads

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30000

# Performance Configuration
COMPRESSION_ENABLED=true
CACHE_TTL=3600

# Monitoring Configuration
METRICS_ENABLED=true
HEALTH_CHECK_ENDPOINT=/health
```

#### Client Environment (`tripvar-client/.env.prod`)

```bash
# API Configuration
VITE_API_URL=https://yourdomain.com
VITE_API_PATH=/api/v1
VITE_HOST=0.0.0.0

# WebSocket Configuration
VITE_WS_URL=wss://yourdomain.com

# Environment
NODE_ENV=production

# App Configuration
VITE_APP_NAME=TripVar
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEBUG_LOGGING=false
VITE_ENABLE_ERROR_REPORTING=true

# Docker Configuration
DOCKER=true
VITE_DOCKER=true

# Performance Configuration
VITE_ENABLE_COMPRESSION=true
VITE_ENABLE_CACHING=true

# Security Configuration
VITE_ENABLE_HTTPS=true
VITE_ENABLE_CSP=true
```

### Security Configuration

#### Firewall Setup

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (be careful with this!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

#### SSH Security

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# Port 22 (or change to custom port)
# PermitRootLogin no
# PasswordAuthentication no (if using SSH keys)
# PubkeyAuthentication yes

# Restart SSH service
sudo systemctl restart ssh
```

## 🐳 Docker Configuration

### Production Docker Compose

The production setup includes:
- **MongoDB** with authentication
- **Redis** with password protection
- **Node.js Server** with production optimizations
- **React Client** with production build
- **Nginx** reverse proxy with SSL termination

### Resource Limits

The configuration includes resource limits optimized for Raspberry Pi 5:

```yaml
deploy:
  resources:
    limits:
      memory: 1G      # MongoDB and Server
      cpus: '1.0'     # MongoDB and Server
    reservations:
      memory: 512M    # MongoDB and Server
      cpus: '0.5'     # MongoDB and Server
```

### Volume Management

```bash
# View Docker volumes
docker volume ls

# Backup volumes
docker run --rm -v tripvar_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v tripvar_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## 🔒 SSL Certificate Management

### Let's Encrypt Setup

```bash
# Install certbot
sudo apt install -y certbot

# Generate certificate
sudo ./scripts/setup-ssl.sh -d yourdomain.com -e your-email@example.com

# Test certificate renewal
sudo certbot renew --dry-run
```

### Certificate Auto-Renewal

The setup includes automatic certificate renewal:
- **Cron job**: Runs monthly to check for renewal
- **Nginx reload**: Automatically reloads after renewal
- **Logging**: All renewal activities are logged

## 📊 Monitoring and Logging

### Service Management

```bash
# Check service status
sudo systemctl status tripvar

# View service logs
sudo journalctl -u tripvar -f

# Restart service
sudo systemctl restart tripvar

# Stop service
sudo systemctl stop tripvar
```

### Application Logs

```bash
# View application logs
tail -f /opt/tripvar/logs/app.log

# View Nginx logs
tail -f /opt/tripvar/logs/nginx/access.log
tail -f /opt/tripvar/logs/nginx/error.log

# View Docker logs
docker-compose -f /opt/tripvar/docker-compose.prod.yml logs -f
```

### Health Monitoring

```bash
# Check API health
curl -f https://yourdomain.com/health

# Check all services
curl -f https://yourdomain.com/api/v1/health

# Monitor script (runs every 5 minutes)
cat /opt/tripvar/logs/monitor.log
```

### Performance Monitoring

```bash
# System resources
htop
df -h
free -h

# Docker resource usage
docker stats

# Service status
sudo systemctl status tripvar
```

## 🔄 Backup and Recovery

### Automated Backups

The system includes automated daily backups:
- **Application files**: Complete project backup
- **Database**: MongoDB data export
- **Redis**: Redis data backup
- **Retention**: 7 days of backups

### Manual Backup

```bash
# Create manual backup
sudo /opt/tripvar/scripts/backup.sh

# List backups
ls -la /opt/tripvar/backups/
```

### Recovery Process

```bash
# Stop services
sudo systemctl stop tripvar

# Restore from backup
cd /opt/tripvar/backups/
tar -xzf tripvar_backup_YYYYMMDD_HHMMSS.tar.gz -C /opt/tripvar/

# Restore database
docker run --rm -v tripvar_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup_YYYYMMDD_HHMMSS.tar.gz -C /data

# Start services
sudo systemctl start tripvar
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check service status
sudo systemctl status tripvar

# Check Docker status
docker ps -a

# Check logs
sudo journalctl -u tripvar -n 50
```

#### 2. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /opt/tripvar/ssl/cert.pem -text -noout

# Check certificate expiration
openssl x509 -in /opt/tripvar/ssl/cert.pem -dates -noout

# Renew certificate manually
sudo certbot renew --force-renewal
```

#### 3. Database Connection Issues

```bash
# Check MongoDB status
docker-compose -f /opt/tripvar/docker-compose.prod.yml exec mongodb mongosh --eval "db.runCommand('ping')"

# Check Redis status
docker-compose -f /opt/tripvar/docker-compose.prod.yml exec redis redis-cli ping
```

#### 4. Performance Issues

```bash
# Check system resources
htop
free -h
df -h

# Check Docker resource usage
docker stats

# Check service logs for errors
grep -i error /opt/tripvar/logs/app.log
```

### Log Analysis

```bash
# Search for errors
grep -i error /opt/tripvar/logs/app.log

# Monitor real-time logs
tail -f /opt/tripvar/logs/app.log

# Analyze access patterns
grep "GET /api" /opt/tripvar/logs/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr
```

## 🔧 Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks
- Check service status
- Review logs for errors
- Monitor disk space
- Check certificate expiration

#### Monthly Tasks
- Update system packages
- Review backup integrity
- Check resource usage trends
- Review security logs

#### Quarterly Tasks
- Full system backup
- Security audit
- Performance optimization review
- Update documentation

### Update Process

```bash
# Stop services
sudo systemctl stop tripvar

# Backup current version
sudo /opt/tripvar/scripts/backup.sh

# Update code
cd /opt/tripvar
git pull origin main

# Rebuild and restart
sudo systemctl start tripvar

# Verify deployment
curl -f https://yourdomain.com/health
```

## 📈 Performance Optimization

### Raspberry Pi 5 Optimizations

1. **Enable GPU memory split:**
   ```bash
   sudo raspi-config
   # Advanced Options → Memory Split → 16
   ```

2. **Optimize boot configuration:**
   ```bash
   sudo nano /boot/config.txt
   # Add: gpu_mem=16
   ```

3. **Enable hardware acceleration:**
   ```bash
   sudo nano /boot/config.txt
   # Add: dtoverlay=vc4-kms-v3d
   ```

### Application Optimizations

1. **Database indexing:**
   ```javascript
   // Add indexes for frequently queried fields
   db.users.createIndex({ email: 1 }, { unique: true })
   db.destinations.createIndex({ name: "text", description: "text" })
   db.bookings.createIndex({ userId: 1, createdAt: -1 })
   ```

2. **Redis caching:**
   - API responses: 5-15 minutes
   - User sessions: 24 hours
   - Static data: 1 hour

3. **Nginx caching:**
   - Static files: 1 year
   - API responses: 5 minutes

## 🔐 Security Best Practices

### System Security

1. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Firewall configuration:**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **SSH key authentication:**
   ```bash
   ssh-keygen -t rsa -b 4096
   ssh-copy-id user@your-pi-ip
   ```

### Application Security

1. **Strong passwords:**
   - MongoDB: 32+ characters
   - Redis: 32+ characters
   - JWT: 64+ characters

2. **HTTPS enforcement:**
   - SSL certificates from Let's Encrypt
   - HTTP to HTTPS redirect
   - HSTS headers

3. **Rate limiting:**
   - API endpoints: 10 requests/second
   - Login attempts: 5 attempts/minute

## 📞 Support and Resources

### Getting Help

1. **Check logs first:**
   ```bash
   sudo journalctl -u tripvar -n 100
   ```

2. **Health check endpoints:**
   - `https://yourdomain.com/health`
   - `https://yourdomain.com/api/v1/health`

3. **Docker troubleshooting:**
   ```bash
   docker-compose -f /opt/tripvar/docker-compose.prod.yml logs
   docker-compose -f /opt/tripvar/docker-compose.prod.yml ps
   ```

### Useful Commands

```bash
# Service management
sudo systemctl start|stop|restart|status tripvar

# Log viewing
sudo journalctl -u tripvar -f
tail -f /opt/tripvar/logs/app.log

# Docker management
docker-compose -f /opt/tripvar/docker-compose.prod.yml up -d
docker-compose -f /opt/tripvar/docker-compose.prod.yml down
docker-compose -f /opt/tripvar/docker-compose.prod.yml logs -f

# Backup and restore
sudo /opt/tripvar/scripts/backup.sh
sudo /opt/tripvar/scripts/restore.sh

# SSL management
sudo certbot renew
sudo ./scripts/setup-ssl.sh -d yourdomain.com -e your-email@example.com
```

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality** on your domain
2. **Set up monitoring alerts** (optional)
3. **Configure automated backups** (already included)
4. **Set up log rotation** (already configured)
5. **Monitor performance** and optimize as needed
6. **Keep system updated** regularly

## 📝 Changelog

- **v1.0.0** - Initial Raspberry Pi 5 deployment guide
- **v1.1.0** - Added SSL certificate automation
- **v1.2.0** - Added systemd service integration
- **v1.3.0** - Added monitoring and backup automation

---

**Congratulations!** Your TripVar application is now running on your Raspberry Pi 5 with production-ready configuration, SSL certificates, and automated monitoring. 🎉

For additional support or questions, please refer to the main project documentation or create an issue in the GitHub repository.