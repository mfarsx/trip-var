# TripVar Production Quick Start Guide

This is a condensed guide for quickly deploying TripVar to production. For detailed information, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md).

## 🚀 60-Second Overview

```bash
# 1. Setup environment
bash scripts/setup-production.sh

# 2. Configure SSL
sudo bash scripts/setup-ssl.sh -d yourdomain.com -e admin@yourdomain.com

# 3. Deploy
bash scripts/deploy.sh

# 4. Verify
bash scripts/health-check.sh
```

## 📋 Prerequisites

- Ubuntu 20.04+ or Debian 10+ (or Raspberry Pi OS for Pi 5)
- Docker & Docker Compose installed
- Domain name pointing to your server
- Ports 80 and 443 open
- Root/sudo access

## 🔧 Step-by-Step Deployment

### Step 1: Install Docker (if needed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

### Step 2: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/your-username/tripvar.git
cd tripvar
sudo chown -R $USER:$USER .
```

### Step 3: Run Setup Script

```bash
bash scripts/setup-production.sh
```

This creates:

- `.env.prod` files with secure credentials
- Necessary directories (logs, ssl, backups)
- Updated nginx configuration

**Save the generated credentials shown at the end!**

### Step 4: Configure SSL

**Option A: Let's Encrypt (Recommended)**

```bash
sudo bash scripts/setup-ssl.sh -d yourdomain.com -e admin@yourdomain.com
```

**Option B: Self-Signed (Testing Only)**

```bash
bash scripts/generate-ssl.sh
```

### Step 5: Deploy

```bash
bash scripts/deploy.sh
```

This will:

- Validate environment
- Create backup
- Build images
- Start services
- Run health checks

### Step 6: Verify Deployment

```bash
# Check all services
bash scripts/health-check.sh

# Or manually
curl https://yourdomain.com/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ✅ Verification Checklist

Visit these URLs to verify:

- [ ] `https://yourdomain.com` - Main website loads
- [ ] `https://yourdomain.com/health` - Returns `{"status":"ok"}`
- [ ] `https://yourdomain.com/api-docs` - Swagger docs load
- [ ] Test user registration and login

## 🔍 Troubleshooting

### Containers won't start

```bash
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml restart
```

### Database connection error

```bash
# Check MongoDB
docker logs tripvar-mongodb-prod

# Verify credentials in .env.prod
cat tripvar-server/.env.prod | grep MONGODB
```

### SSL issues

```bash
# Check certificate
openssl x509 -in ssl/cert.pem -text -noout

# Test nginx config
docker exec tripvar-nginx-prod nginx -t
```

### High resource usage

```bash
# Check container stats
docker stats

# Restart if needed
docker-compose -f docker-compose.prod.yml restart
```

## 🛠️ Common Operations

### View Logs

```bash
# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f server
```

### Restart Services

```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart server
```

### Update Application

```bash
git pull origin main
bash scripts/deploy.sh
```

### Backup Database

```bash
bash scripts/deploy.sh backup
```

### Rollback

```bash
bash scripts/deploy.sh rollback
```

### Stop Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

### Check Status

```bash
bash scripts/show-status.sh
```

### Monitor Resources

```bash
# One-time check
docker stats --no-stream

# Continuous monitoring
bash scripts/monitor-continuous.sh
```

### Health Checks

```bash
# Automated check
bash scripts/health-check.sh

# Manual checks
curl https://yourdomain.com/health
curl https://yourdomain.com/health/db
curl https://yourdomain.com/health/redis
curl https://yourdomain.com/health/all
```

## 🔐 Security Notes

### After Setup, Verify:

- [ ] `.env.prod` files have 600 permissions
- [ ] SSL certificate is valid
- [ ] Firewall allows only 80, 443, and SSH
- [ ] Strong passwords generated
- [ ] Credentials saved securely (password manager)

### Secure Your Server

```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

## 📁 Important Files

| File                       | Description                |
| -------------------------- | -------------------------- |
| `.env.prod`                | Root environment variables |
| `tripvar-server/.env.prod` | Server configuration       |
| `tripvar-client/.env.prod` | Client configuration       |
| `docker-compose.prod.yml`  | Production Docker compose  |
| `nginx/nginx.prod.conf`    | Nginx configuration        |
| `ssl/cert.pem`             | SSL certificate            |
| `ssl/key.pem`              | SSL private key            |
| `logs/`                    | Application logs           |
| `backups/`                 | Database backups           |

## 📍 Important URLs

| URL                               | Purpose            |
| --------------------------------- | ------------------ |
| `https://yourdomain.com`          | Main application   |
| `https://yourdomain.com/api/v1`   | API base URL       |
| `https://yourdomain.com/api-docs` | API documentation  |
| `https://yourdomain.com/health`   | Health check       |
| `wss://yourdomain.com/ws`         | WebSocket endpoint |

## 🆘 Emergency Commands

### Application Down

```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### Database Issues

```bash
# Check MongoDB
docker exec -it tripvar-mongodb-prod mongosh -u admin -p

# Restore from backup
docker run --rm -v tripvar_mongodb_data:/data \
  -v $(pwd)/backups/backup_LATEST:/backup alpine \
  tar xzf /backup/mongodb_backup.tar.gz -C /data
```

### Complete Reset (⚠️ Destroys Data)

```bash
# Stop and remove everything
docker-compose -f docker-compose.prod.yml down -v

# Rebuild and start fresh
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📞 Next Steps

After successful deployment:

1. ✅ **Test thoroughly** - Try all main features
2. 📊 **Monitor** - Check logs and metrics regularly
3. 🔐 **Secure** - Review security checklist
4. 💾 **Backup** - Verify automated backups
5. 📚 **Document** - Keep notes on your setup
6. 🎯 **Optimize** - Fine-tune based on usage

## 📖 More Resources

- **Full Guide**: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Checklist**: [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
- **API Docs**: [tripvar-server/API_ENDPOINTS.md](tripvar-server/API_ENDPOINTS.md)
- **GitHub**: [https://github.com/your-username/tripvar](https://github.com/your-username/tripvar)

## 💡 Pro Tips

1. **Always test in staging first** before production deployment
2. **Schedule deployments during low-traffic hours**
3. **Keep backups before any major changes**
4. **Monitor logs for the first 24 hours** after deployment
5. **Document any custom configurations** you make
6. **Set up automated backups immediately**
7. **Enable monitoring and alerts** for peace of mind

---

**Need help?** Check [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for detailed troubleshooting or open an issue on GitHub.

**Success?** 🎉 Your TripVar application is now running in production!
