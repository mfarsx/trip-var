# TripVar Production Deployment Guide

This guide provides comprehensive instructions for deploying TripVar to production environments.

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- 4GB+ RAM and 20GB+ disk space
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd tripvar
cp tripvar-server/.env.example tripvar-server/.env.prod
cp tripvar-client/.env.example tripvar-client/.env.prod
```

### 2. Configure Environment

Edit the production environment files:

**tripvar-server/.env.prod:**
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

# Security Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# SSL Configuration
SSL_ENABLED=true
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

**tripvar-client/.env.prod:**
```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_API_PATH=/api/v1
VITE_HOST=0.0.0.0

# Environment
NODE_ENV=production

# App Configuration
VITE_APP_NAME=TripVar
VITE_APP_VERSION=1.0.0
```

### 3. Deploy

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh deploy
```

## 🔧 Detailed Configuration

### Security Configuration

#### SSL/TLS Setup

1. **Obtain SSL Certificates:**
   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

2. **Copy certificates to ssl directory:**
   ```bash
   mkdir -p ssl
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
   ```

#### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ | - |
| `MONGO_PASSWORD` | MongoDB user password | ✅ | - |
| `REDIS_PASSWORD` | Redis password | ✅ | - |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | ✅ | - |
| `SSL_ENABLED` | Enable SSL/TLS | ❌ | false |
| `LOG_LEVEL` | Logging level | ❌ | info |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limit | ❌ | 100 |

### Database Configuration

#### MongoDB Security

1. **Enable Authentication:**
   ```bash
   # Connect to MongoDB
   docker exec -it tripvar-mongodb-prod mongosh

   # Create admin user
   use admin
   db.createUser({
     user: "admin",
     pwd: "YOUR_ADMIN_PASSWORD",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
   })

   # Create application user
   use tripvar
   db.createUser({
     user: "tripvar_user",
     pwd: "YOUR_APP_PASSWORD",
     roles: ["readWrite"]
   })
   ```

2. **Configure Replica Set (Optional):**
   ```yaml
   # In docker-compose.prod.yml
   mongodb:
     command: ["mongod", "--replSet", "rs0", "--auth"]
   ```

#### Redis Security

1. **Enable Authentication:**
   ```bash
   # Set password in environment
   REDIS_PASSWORD=your_secure_redis_password
   ```

2. **Configure Persistence:**
   ```yaml
   # AOF persistence is enabled by default
   redis:
     command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
   ```

### Performance Optimization

#### Caching Strategy

1. **Redis Caching:**
   - API responses: 5-15 minutes
   - User sessions: 24 hours
   - Static data: 1 hour

2. **Database Indexing:**
   ```javascript
   // Add indexes for frequently queried fields
   db.users.createIndex({ email: 1 }, { unique: true })
   db.destinations.createIndex({ name: "text", description: "text" })
   db.bookings.createIndex({ userId: 1, createdAt: -1 })
   ```

#### Resource Limits

```yaml
# In docker-compose.prod.yml
services:
  server:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### Monitoring and Logging

#### Health Checks

- **API Health:** `GET /health`
- **Database Health:** `GET /health/db`
- **Redis Health:** `GET /health/redis`
- **System Metrics:** `GET /health/metrics`

#### Log Management

1. **Log Rotation:**
   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/tripvar
   ```

   ```
   /opt/tripvar/logs/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 644 root root
   }
   ```

2. **Log Monitoring:**
   ```bash
   # View logs
   docker-compose -f docker-compose.prod.yml logs -f

   # View specific service logs
   docker-compose -f docker-compose.prod.yml logs -f server
   ```

## 🚀 Deployment Options

### Option 1: Automated Deployment

```bash
# Full deployment with backup
./scripts/deploy.sh deploy

# Health check only
./scripts/deploy.sh health

# Create backup only
./scripts/deploy.sh backup

# Rollback to previous version
./scripts/deploy.sh rollback
```

### Option 2: Manual Deployment

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 3: CI/CD Deployment

1. **Configure GitHub Secrets:**
   - `PRODUCTION_HOST`: Server IP/hostname
   - `PRODUCTION_USER`: SSH username
   - `PRODUCTION_SSH_KEY`: SSH private key
   - `SLACK_WEBHOOK`: Slack notification webhook

2. **Deploy via GitHub Actions:**
   - Push to `main` branch triggers automatic deployment
   - Manual rollback available via GitHub Actions

## 🔍 Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs server

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart server
```

#### 2. Database Connection Issues

```bash
# Check MongoDB status
docker-compose -f docker-compose.prod.yml exec mongodb mongosh --eval "db.runCommand('ping')"

# Check network connectivity
docker-compose -f docker-compose.prod.yml exec server ping mongodb
```

#### 3. SSL Certificate Issues

```bash
# Verify certificate
openssl x509 -in ssl/cert.pem -text -noout

# Check certificate expiration
openssl x509 -in ssl/cert.pem -dates -noout

# Renew Let's Encrypt certificate
certbot renew --dry-run
```

#### 4. Performance Issues

```bash
# Check system resources
htop
df -h
free -h

# Check container resource usage
docker stats

# Monitor database performance
docker-compose -f docker-compose.prod.yml exec mongodb mongosh --eval "db.serverStatus()"
```

### Log Analysis

```bash
# Search for errors
grep -i error logs/app.log

# Monitor real-time logs
tail -f logs/app.log

# Analyze access patterns
grep "GET /api" logs/app.log | awk '{print $1}' | sort | uniq -c | sort -nr
```

## 🔒 Security Checklist

- [ ] Strong passwords for all services (MongoDB, Redis, JWT)
- [ ] SSL/TLS certificates installed and valid
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular security updates applied
- [ ] Database authentication enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Log monitoring in place
- [ ] Backup strategy implemented

## 📊 Monitoring Setup

### Application Metrics

1. **Health Monitoring:**
   ```bash
   # Setup monitoring script
   cat > monitor.sh << 'EOF'
   #!/bin/bash
   while true; do
     curl -f http://localhost:8000/health || echo "Health check failed"
     sleep 60
   done
   EOF
   chmod +x monitor.sh
   ```

2. **Log Monitoring:**
   ```bash
   # Install log monitoring tools
   sudo apt-get install logwatch
   
   # Configure logwatch
   sudo nano /etc/logwatch/conf/logwatch.conf
   ```

### External Monitoring

- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry, Bugsnag
- **Performance Monitoring:** New Relic, DataDog
- **Log Aggregation:** ELK Stack, Splunk

## 🔄 Backup and Recovery

### Automated Backups

```bash
# Setup daily backup cron job
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /opt/tripvar/scripts/deploy.sh backup
```

### Manual Backup

```bash
# Create backup
./scripts/deploy.sh backup

# Restore from backup
./scripts/deploy.sh rollback
```

### Database Backup

```bash
# MongoDB backup
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup

# Redis backup
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Setup:**
   ```yaml
   # nginx load balancer configuration
   upstream backend {
       server server1:8000;
       server server2:8000;
       server server3:8000;
   }
   ```

2. **Database Scaling:**
   - MongoDB replica set
   - Redis cluster
   - Connection pooling

### Vertical Scaling

```yaml
# Increase resource limits
services:
  server:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 🆘 Support

### Getting Help

1. **Check Logs:** Always check application logs first
2. **Health Checks:** Use built-in health check endpoints
3. **Documentation:** Refer to this guide and README.md
4. **Issues:** Create GitHub issues for bugs
5. **Community:** Join our Discord/Slack for support

### Emergency Procedures

1. **Service Down:**
   ```bash
   # Quick restart
   docker-compose -f docker-compose.prod.yml restart
   
   # Full restart
   docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Database Issues:**
   ```bash
   # Restore from backup
   ./scripts/deploy.sh rollback
   ```

3. **Security Incident:**
   - Change all passwords immediately
   - Review access logs
   - Update SSL certificates
   - Notify users if necessary

---

## 📝 Changelog

- **v1.0.0** - Initial production deployment guide
- **v1.1.0** - Added CI/CD configuration
- **v1.2.0** - Enhanced security and monitoring
- **v1.3.0** - Added scaling and performance optimization

For more information, visit our [GitHub repository](https://github.com/mfarsx/tripvar) or contact the development team.