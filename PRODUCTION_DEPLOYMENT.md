# TripVar Production Deployment Guide

This guide provides comprehensive instructions for deploying TripVar to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Initial Setup](#initial-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Deployment](#deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedure](#rollback-procedure)
- [Security Best Practices](#security-best-practices)

## Prerequisites

### Hardware Requirements

- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Operating System**: Ubuntu 20.04 LTS or later, Debian 10+, or Raspberry Pi OS (for Pi 5)

### Software Requirements

- Docker 20.10 or later
- Docker Compose 2.0 or later
- OpenSSL (for SSL certificate generation)
- Git (for cloning repository)
- sudo/root access

### Network Requirements

- Public IP address or domain name
- Ports 80 (HTTP) and 443 (HTTPS) open and accessible
- Port 22 (SSH) for remote access
- Firewall configured to allow necessary traffic

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Domain name configured and pointing to your server
- [ ] DNS A records set up for your domain and www subdomain
- [ ] SSH access to your production server
- [ ] Backup strategy in place
- [ ] SSL certificates ready (or prepared to generate)
- [ ] Environment variables prepared
- [ ] Database backup/restore plan
- [ ] Monitoring tools configured
- [ ] Alert system set up

## Initial Setup

### 1. Clone the Repository

```bash
# SSH into your production server
ssh user@your-server.com

# Navigate to your desired installation directory
cd /opt

# Clone the repository
sudo git clone https://github.com/your-username/tripvar.git
cd tripvar

# Set proper ownership
sudo chown -R $USER:$USER /opt/tripvar
```

### 2. Install Docker and Docker Compose

If not already installed:

```bash
# Run the Docker setup script
bash scripts/docker-setup.sh
```

Or manually:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes to take effect
exit
```

### 3. Run Production Setup

The production setup script will guide you through configuration:

```bash
bash scripts/setup-production.sh
```

This script will:

- Generate secure passwords and JWT secrets
- Create environment files (`.env.prod`)
- Update nginx configuration with your domain
- Create necessary directories
- Set proper file permissions

**Alternative Manual Setup:**

If you prefer to set up manually, create the environment files:

```bash
# Root environment file
cat > .env.prod << EOF
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=YOUR_SECURE_PASSWORD
MONGO_USERNAME=tripvar_user
MONGO_PASSWORD=YOUR_SECURE_PASSWORD
REDIS_PASSWORD=YOUR_SECURE_PASSWORD
DOMAIN=yourdomain.com
WWW_DOMAIN=www.yourdomain.com
EOF

# Server environment file
cp tripvar-server/.env.prod.example tripvar-server/.env.prod
# Edit and fill in the values

# Client environment file
cp tripvar-client/.env.prod.example tripvar-client/.env.prod
# Edit and fill in the values
```

### 4. Update Configuration Files

Edit the nginx configuration with your actual domain:

```bash
# Update nginx configuration
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx/nginx.prod.conf
```

## SSL/HTTPS Configuration

### Option 1: Let's Encrypt (Recommended for Production)

```bash
# Run the SSL setup script
sudo bash scripts/setup-ssl.sh -d yourdomain.com -e admin@yourdomain.com

# For testing, use staging environment first:
sudo bash scripts/setup-ssl.sh -d yourdomain.com -e admin@yourdomain.com --staging
```

### Option 2: Self-Signed Certificates (Development/Testing Only)

```bash
# Generate self-signed certificates
bash scripts/generate-ssl.sh
```

### Option 3: Use Existing Certificates

```bash
# Copy your certificates to the ssl directory
mkdir -p ssl
cp /path/to/your/cert.pem ssl/cert.pem
cp /path/to/your/key.pem ssl/key.pem

# Set proper permissions
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

## Deployment

### First-Time Deployment

```bash
# Run the full deployment script
bash scripts/deploy.sh

# This will:
# 1. Check prerequisites
# 2. Validate environment variables
# 3. Create backup
# 4. Build Docker images
# 5. Start all services
# 6. Run health checks
# 7. Clean up old resources
```

### Manual Deployment Steps

If you prefer to deploy manually:

```bash
# 1. Pull latest images
docker-compose -f docker-compose.prod.yml pull

# 2. Build custom images
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Stop existing containers
docker-compose -f docker-compose.prod.yml down

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Check status
docker-compose -f docker-compose.prod.yml ps

# 6. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Updating an Existing Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Run deployment script
bash scripts/deploy.sh

# Or use zero-downtime deployment:
docker-compose -f docker-compose.prod.yml up -d --no-deps --build server
docker-compose -f docker-compose.prod.yml up -d --no-deps --build client
```

## Post-Deployment

### 1. Verify Services

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check health endpoints
bash scripts/health-check.sh

# Or manually:
curl http://localhost:8000/health
curl https://yourdomain.com/health
```

### 2. Verify Application

- Visit `https://yourdomain.com` in your browser
- Test user registration and login
- Test core functionality
- Check browser console for errors
- Verify API responses

### 3. Check Logs

```bash
# View all logs
bash scripts/logs.sh

# View specific service logs
docker-compose -f docker-compose.prod.yml logs server
docker-compose -f docker-compose.prod.yml logs client
docker-compose -f docker-compose.prod.yml logs mongodb
docker-compose -f docker-compose.prod.yml logs redis

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f server
```

### 4. Monitor Resources

```bash
# View system status
bash scripts/show-status.sh

# Continuous monitoring
bash scripts/monitor-continuous.sh

# Check Docker stats
docker stats
```

## Monitoring and Maintenance

### Health Checks

The application provides several health check endpoints:

- `/health` - Basic health status
- `/health/db` - Database connectivity
- `/health/redis` - Redis connectivity
- `/health/metrics` - System metrics
- `/health/all` - Comprehensive health check
- `/health/ready` - Readiness probe (Kubernetes)
- `/health/live` - Liveness probe (Kubernetes)

### Log Management

Logs are automatically rotated and compressed:

```bash
# Log locations
/opt/tripvar/logs/              # Application logs
/opt/tripvar/logs/nginx/        # Nginx logs

# View recent errors
tail -f logs/error-$(date +%Y-%m-%d).log

# Search logs
grep "ERROR" logs/combined-*.log

# Clean old logs (older than 30 days)
find logs/ -name "*.log.gz" -mtime +30 -delete
```

### Database Backup

```bash
# Create manual backup
bash scripts/deploy.sh backup

# Automated backup (add to crontab)
0 2 * * * /opt/tripvar/scripts/deploy.sh backup >> /opt/tripvar/logs/backup.log 2>&1
```

### Resource Monitoring

Monitor your application's resource usage:

```bash
# CPU and Memory usage
docker stats

# Disk usage
df -h
du -sh /opt/tripvar/*

# Network connections
netstat -tulpn | grep LISTEN
```

### SSL Certificate Renewal

Let's Encrypt certificates auto-renew via cron:

```bash
# Check certificate expiration
openssl x509 -in ssl/cert.pem -noout -dates

# Manual renewal (if needed)
bash scripts/renew-ssl.sh

# Verify auto-renewal cron job
crontab -l
```

## Troubleshooting

### Common Issues

#### 1. Containers Won't Start

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs

# Check specific container
docker logs tripvar-server-prod

# Restart specific service
docker-compose -f docker-compose.prod.yml restart server
```

#### 2. Database Connection Errors

```bash
# Check MongoDB container
docker-compose -f docker-compose.prod.yml logs mongodb

# Verify MongoDB is running
docker exec -it tripvar-mongodb-prod mongosh -u admin -p

# Check connection from server
docker exec -it tripvar-server-prod sh
# Inside container: nc -zv mongodb 27017
```

#### 3. Redis Connection Errors

```bash
# Check Redis container
docker-compose -f docker-compose.prod.yml logs redis

# Test Redis connection
docker exec -it tripvar-redis-prod redis-cli -a YOUR_REDIS_PASSWORD ping
```

#### 4. Nginx/SSL Issues

```bash
# Check nginx configuration
docker exec -it tripvar-nginx-prod nginx -t

# Reload nginx
docker exec -it tripvar-nginx-prod nginx -s reload

# Check SSL certificate
openssl x509 -in ssl/cert.pem -text -noout
```

#### 5. High Memory Usage

```bash
# Check container memory usage
docker stats

# Restart containers
docker-compose -f docker-compose.prod.yml restart

# Adjust resource limits in docker-compose.prod.yml
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Edit server .env.prod
LOG_LEVEL=debug

# Restart server
docker-compose -f docker-compose.prod.yml restart server

# View debug logs
docker-compose -f docker-compose.prod.yml logs -f server
```

## Rollback Procedure

If deployment fails or issues arise:

```bash
# 1. Use the rollback command
bash scripts/deploy.sh rollback

# This will:
# - Stop current containers
# - Restore from most recent backup
# - Start services with previous version
# - Run health checks

# 2. Manual rollback
docker-compose -f docker-compose.prod.yml down
# Restore database from backup
docker run --rm -v tripvar_mongodb_data:/data \
  -v $(pwd)/backups/backup_TIMESTAMP:/backup alpine \
  tar xzf /backup/mongodb_backup.tar.gz -C /data
# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## Security Best Practices

### 1. Secure Environment Variables

```bash
# Ensure .env.prod files have restricted permissions
chmod 600 .env.prod
chmod 600 tripvar-server/.env.prod
chmod 600 tripvar-client/.env.prod

# Never commit .env.prod files
git update-index --assume-unchanged .env.prod
```

### 2. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull

# Update base images and rebuild
docker-compose -f docker-compose.prod.yml build --pull --no-cache
```

### 3. Firewall Configuration

```bash
# Configure UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### 4. Monitoring and Alerts

Set up monitoring for:

- Application uptime
- Response times
- Error rates
- Resource usage (CPU, memory, disk)
- SSL certificate expiration

### 5. Backup Strategy

```bash
# Automated daily backups
0 2 * * * /opt/tripvar/scripts/deploy.sh backup >> /opt/tripvar/logs/backup.log 2>&1

# Keep last 30 days of backups
find /opt/tripvar/backups/ -mtime +30 -delete
```

### 6. Access Control

```bash
# Limit SSH access
# Edit /etc/ssh/sshd_config:
# - Disable root login
# - Use key-based authentication
# - Change default SSH port

# Restrict Docker socket access
sudo chmod 660 /var/run/docker.sock
```

## Performance Optimization

### 1. Database Indexes

Ensure proper indexes are created for frequently queried fields:

```javascript
// MongoDB indexes (run in mongosh)
use tripvar
db.destinations.createIndex({ location: 1 })
db.destinations.createIndex({ category: 1 })
db.destinations.createIndex({ rating: -1 })
```

### 2. Redis Caching

Configure Redis for optimal caching:

```bash
# Monitor Redis performance
docker exec -it tripvar-redis-prod redis-cli -a YOUR_PASSWORD INFO stats

# Check cache hit rate
docker exec -it tripvar-redis-prod redis-cli -a YOUR_PASSWORD INFO stats | grep keyspace
```

### 3. Nginx Optimization

The nginx configuration includes:

- Gzip compression
- Static file caching
- Connection keep-alive
- Rate limiting

### 4. Resource Limits

Adjust container resource limits in `docker-compose.prod.yml` based on your hardware and traffic.

## Continuous Deployment

For automated deployments, consider setting up:

1. **GitHub Actions** - Automated CI/CD pipeline
2. **Watchtower** - Automatic container updates
3. **Jenkins** - Self-hosted CI/CD
4. **GitLab CI/CD** - Integrated pipeline

Example GitHub Actions workflow is included in `.github/workflows/deploy.yml`.

## Support and Documentation

- **API Documentation**: `https://yourdomain.com/api-docs`
- **Health Status**: `https://yourdomain.com/health`
- **GitHub Issues**: Report bugs and request features
- **Server Logs**: Check `/opt/tripvar/logs/` for detailed logs

## Quick Reference

### Common Commands

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
bash scripts/health-check.sh

# System status
bash scripts/show-status.sh

# Backup
bash scripts/deploy.sh backup

# Deploy
bash scripts/deploy.sh

# Rollback
bash scripts/deploy.sh rollback
```

### Important Paths

- **Application**: `/opt/tripvar`
- **Logs**: `/opt/tripvar/logs`
- **Backups**: `/opt/tripvar/backups`
- **SSL Certificates**: `/opt/tripvar/ssl`
- **Environment Files**: `/opt/tripvar/.env.prod`, `/opt/tripvar/tripvar-server/.env.prod`, `/opt/tripvar/tripvar-client/.env.prod`

### Environment URLs

- **Production Website**: `https://yourdomain.com`
- **API Base URL**: `https://yourdomain.com/api/v1`
- **API Documentation**: `https://yourdomain.com/api-docs`
- **Health Check**: `https://yourdomain.com/health`
- **WebSocket**: `wss://yourdomain.com/ws`

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
