# GitHub Secrets Setup Guide

This guide will help you configure all required secrets for the CI/CD pipeline.

## Quick Setup Script

Run this script to generate all required secrets:

```bash
#!/bin/bash

echo "=== TripVar CI/CD Secrets Generator ==="
echo ""

# Generate MongoDB password
MONGO_PASSWORD=$(openssl rand -base64 32)
echo "MONGO_PASSWORD: $MONGO_PASSWORD"

# Generate Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "REDIS_PASSWORD: $REDIS_PASSWORD"

# Generate JWT secret (64 characters)
JWT_SECRET=$(openssl rand -base64 48)
echo "JWT_SECRET: $JWT_SECRET"

echo ""
echo "=== Server Environment File (.env.prod) ==="
echo ""
cat << EOF
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb://mongodb:27017/tripvar
MONGO_USER=admin
MONGO_PASSWORD=$MONGO_PASSWORD
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF

echo ""
echo "=== Client Environment File (.env.prod) ==="
echo ""
cat << EOF
VITE_API_URL=https://yourdomain.com/api/v1
VITE_WS_URL=wss://yourdomain.com
VITE_ENV=production
EOF
```

Save this as `generate-secrets.sh` and run:

```bash
chmod +x generate-secrets.sh
./generate-secrets.sh
```

## Required Secrets

### 1. SSH Deployment Credentials

#### SSH_PRIVATE_KEY

Your SSH private key for accessing the production server.

**Generate:**

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Display private key (copy this to GitHub secret)
cat ~/.ssh/github_deploy

# Add public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server.com
```

**Add to GitHub:**

1. Go to Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `SSH_PRIVATE_KEY`
4. Value: Paste the entire private key content (including `-----BEGIN` and `-----END` lines)

#### SSH_USER

Username for SSH access to production server.

**Example:** `ubuntu`, `root`, or your server username

#### SERVER_HOST

Hostname or IP address of your production server.

**Example:** `tripvar.yourdomain.com` or `123.45.67.89`

### 2. Raspberry Pi Deployment (Optional)

#### RPI_SSH_PRIVATE_KEY

SSH private key for Raspberry Pi access.

**Generate same way as SSH_PRIVATE_KEY but for Raspberry Pi**

#### RPI_USER

Username for Raspberry Pi SSH access.

**Example:** `pi` or your Raspberry Pi username

#### RPI_HOST

Hostname or IP address of your Raspberry Pi.

**Example:** `tripvar-rpi.local` or `192.168.1.100`

#### RPI_DOMAIN

Domain name configured for Raspberry Pi deployment.

**Example:** `tripvar.yourdomain.com`

### 3. Environment Variables

#### SERVER_ENV_PROD

Complete content of server production environment file.

**Template:**

```bash
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb://mongodb:27017/tripvar
MONGO_USER=admin
MONGO_PASSWORD=<generated-password>
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=<generated-password>
JWT_SECRET=<generated-secret-64-chars>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
SESSION_SECRET=<generated-secret>
COOKIE_SECRET=<generated-secret>
```

**To add:**

1. Generate all passwords using the script above
2. Replace `<generated-password>` with actual values
3. Replace `yourdomain.com` with your actual domain
4. Copy the entire content
5. Add as GitHub secret named `SERVER_ENV_PROD`

#### CLIENT_ENV_PROD

Complete content of client production environment file.

**Template:**

```bash
VITE_API_URL=https://yourdomain.com/api/v1
VITE_WS_URL=wss://yourdomain.com
VITE_ENV=production
```

**To add:**

1. Replace `yourdomain.com` with your actual domain
2. Copy the entire content
3. Add as GitHub secret named `CLIENT_ENV_PROD`

### 4. Notifications (Optional)

#### SLACK_WEBHOOK

Slack webhook URL for deployment notifications.

**Setup:**

1. Go to your Slack workspace
2. Navigate to Apps → Incoming Webhooks
3. Add to Slack and choose a channel
4. Copy the webhook URL
5. Add as GitHub secret named `SLACK_WEBHOOK`

**Format:** `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`

## Security Best Practices

### 1. Password Generation

Always use strong, random passwords:

```bash
# 32-character password
openssl rand -base64 32

# 64-character secret
openssl rand -base64 48

# Hex format (64 characters)
openssl rand -hex 32
```

### 2. SSH Key Management

- Use Ed25519 keys (more secure than RSA)
- Never commit private keys to repository
- Use different keys for different environments
- Rotate keys periodically

### 3. Secret Rotation

Rotate secrets every 90 days:

1. Generate new secrets
2. Update GitHub secrets
3. Trigger redeployment
4. Verify everything works
5. Revoke old secrets

### 4. Access Control

- Limit who can access GitHub secrets
- Use environment-specific secrets
- Enable branch protection
- Require approvals for deployments

## Verification

After adding all secrets, verify they're set correctly:

### Check GitHub Secrets

1. Go to Repository → Settings → Secrets and variables → Actions
2. You should see these secrets (values hidden):
   - SSH_PRIVATE_KEY
   - SSH_USER
   - SERVER_HOST
   - SERVER_ENV_PROD
   - CLIENT_ENV_PROD
   - (Optional) RPI_SSH_PRIVATE_KEY, RPI_USER, RPI_HOST, RPI_DOMAIN
   - (Optional) SLACK_WEBHOOK

### Test SSH Connection

```bash
# Test SSH connection using the key
ssh -i ~/.ssh/github_deploy user@your-server.com

# Verify you can access the server
hostname
whoami
```

### Validate Environment Files

```bash
# Test server environment
cd tripvar-server
# Copy the SERVER_ENV_PROD content to .env.test
npm run test

# Test client environment
cd tripvar-client
# Copy the CLIENT_ENV_PROD content to .env.test
npm run build
```

## Troubleshooting

### "Permission denied (publickey)"

**Solution:**

1. Verify SSH key is added to server: `ssh-copy-id -i ~/.ssh/github_deploy.pub user@server`
2. Check key permissions: `chmod 600 ~/.ssh/github_deploy`
3. Test SSH: `ssh -i ~/.ssh/github_deploy user@server`

### "Invalid environment variables"

**Solution:**

1. Check for missing required variables
2. Ensure no extra spaces or newlines
3. Verify quotes are properly escaped
4. Test locally with the same .env file

### "Deployment failed - authentication error"

**Solution:**

1. Regenerate secrets and update GitHub
2. Ensure user has sudo privileges on server
3. Check firewall allows SSH (port 22)
4. Verify server is accessible

### "Docker login failed"

**Solution:**

1. Ensure GITHUB_TOKEN has package write permissions
2. Enable GitHub Container Registry in repository settings
3. Check package visibility settings

## Complete Setup Checklist

- [ ] Generate SSH key pair
- [ ] Add public key to production server
- [ ] Add SSH_PRIVATE_KEY to GitHub secrets
- [ ] Add SSH_USER to GitHub secrets
- [ ] Add SERVER_HOST to GitHub secrets
- [ ] Generate strong passwords for MongoDB and Redis
- [ ] Generate JWT secret
- [ ] Create SERVER_ENV_PROD content
- [ ] Add SERVER_ENV_PROD to GitHub secrets
- [ ] Create CLIENT_ENV_PROD content
- [ ] Add CLIENT_ENV_PROD to GitHub secrets
- [ ] (Optional) Set up Raspberry Pi SSH
- [ ] (Optional) Add Slack webhook
- [ ] Test SSH connection
- [ ] Verify all secrets in GitHub
- [ ] Run a test deployment

## Quick Reference

| Secret Name         | Purpose                      | Required |
| ------------------- | ---------------------------- | -------- |
| SSH_PRIVATE_KEY     | SSH key for server access    | Yes      |
| SSH_USER            | Server SSH username          | Yes      |
| SERVER_HOST         | Server hostname/IP           | Yes      |
| SERVER_ENV_PROD     | Server environment variables | Yes      |
| CLIENT_ENV_PROD     | Client environment variables | Yes      |
| RPI_SSH_PRIVATE_KEY | Raspberry Pi SSH key         | No       |
| RPI_USER            | Raspberry Pi username        | No       |
| RPI_HOST            | Raspberry Pi hostname/IP     | No       |
| RPI_DOMAIN          | Domain for Raspberry Pi      | No       |
| SLACK_WEBHOOK       | Slack notifications          | No       |

## Next Steps

After configuring all secrets:

1. Push to a feature branch to trigger test workflows
2. Create a PR to trigger all checks
3. Merge to main to trigger deployment
4. Monitor GitHub Actions for any issues
5. Verify application is running on server

## Support

If you need help:

1. Check workflow logs in GitHub Actions
2. Review error messages carefully
3. Test SSH and environment variables locally
4. Open an issue if problem persists

---

**Security Note:** Never share or commit these secrets to the repository!
