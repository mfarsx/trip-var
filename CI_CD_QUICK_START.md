# CI/CD Pipeline Quick Start Guide

Get your CI/CD pipeline up and running in 15 minutes!

## 🚀 What You'll Get

- ✅ Automated testing on every PR
- ✅ Docker image building
- ✅ Security scanning
- ✅ Automated deployment to production
- ✅ Slack notifications (optional)
- ✅ Dependency updates via Dependabot

## 📋 Prerequisites

- GitHub repository with admin access
- Production server with SSH access (or Raspberry Pi)
- Domain name (optional but recommended)
- 15 minutes of your time

## ⚡ Quick Setup (5 Steps)

### Step 1: Generate Secrets (2 minutes)

```bash
# Clone the repository if you haven't
git clone https://github.com/mfarsx/tripvar.git
cd tripvar

# Create and run the secrets generator
cat > generate-secrets.sh << 'EOF'
#!/bin/bash
echo "MONGO_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 48)"
EOF

chmod +x generate-secrets.sh
./generate-secrets.sh
```

**Save the output!** You'll need these values.

### Step 2: Setup SSH Access (3 minutes)

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy -N ""

# Copy to your server (replace with your details)
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server.com

# Verify connection
ssh -i ~/.ssh/github_deploy user@your-server.com "echo 'Connection successful!'"

# Display private key (you'll copy this to GitHub)
cat ~/.ssh/github_deploy
```

### Step 3: Configure GitHub Secrets (5 minutes)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

#### Required Secrets:

**SSH_PRIVATE_KEY**

```
Copy the entire content from: cat ~/.ssh/github_deploy
(Including -----BEGIN and -----END lines)
```

**SSH_USER**

```
Your server username (e.g., ubuntu, root, pi)
```

**SERVER_HOST**

```
Your server IP or hostname (e.g., 123.45.67.89 or server.yourdomain.com)
```

**SERVER_ENV_PROD**

```
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb://mongodb:27017/tripvar
MONGO_USER=admin
MONGO_PASSWORD=<paste-from-step-1>
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=<paste-from-step-1>
JWT_SECRET=<paste-from-step-1>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**CLIENT_ENV_PROD**

```
VITE_API_URL=https://yourdomain.com/api/v1
VITE_WS_URL=wss://yourdomain.com
VITE_ENV=production
```

### Step 4: Push the CI/CD Configuration (2 minutes)

```bash
# Ensure you're on main branch
git checkout main

# Add all CI/CD files
git add .github/

# Commit
git commit -m "ci: add GitHub Actions CI/CD pipeline"

# Push to GitHub
git push origin main
```

### Step 5: Verify Everything Works (3 minutes)

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see workflows running
4. Wait for them to complete (≈5 minutes)

**Success indicators:**

- ✅ Test Suite workflow passes
- ✅ Build workflow passes
- ✅ Security workflow completes
- ✅ Docker images appear in Packages tab

## 🧪 Test the Pipeline

### Create a Test PR

```bash
# Create a feature branch
git checkout -b test/ci-cd-pipeline

# Make a small change
echo "# CI/CD Test" >> test-file.md

# Commit and push
git add test-file.md
git commit -m "test: verify CI/CD pipeline"
git push origin test/ci-cd-pipeline

# Create PR on GitHub
gh pr create --title "test: CI/CD pipeline verification" --body "Testing automated checks"
```

**What happens:**

1. ✅ Tests run automatically
2. ✅ Security scan runs
3. ✅ PR quality checks comment on the PR
4. ✅ Build workflow validates Docker images

### Trigger Deployment

```bash
# Merge the PR (if tests pass)
gh pr merge --auto --squash

# Or merge on GitHub UI
```

**What happens:**

1. ✅ All tests run again
2. ✅ Docker images build and push to registry
3. ✅ Deployment workflow triggers
4. ✅ Application deploys to production
5. ✅ Health checks verify deployment

## 📊 Monitor Your Pipeline

### View Workflow Status

```bash
# Install GitHub CLI if not already
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate
gh auth login

# Watch current run
gh run watch

# List recent runs
gh run list

# View specific workflow
gh run list --workflow=test.yml
```

### Check Deployment Status

```bash
# SSH into server
ssh -i ~/.ssh/github_deploy user@your-server.com

# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check application health
curl http://localhost:8000/health
```

## 🎯 Next Steps

### 1. Enable Branch Protection

1. Go to **Settings** → **Branches**
2. Add rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks (select: Test Server, Test Client)
   - ✅ Require branches up to date

### 2. Set Up Notifications (Optional)

**Slack Integration:**

1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Add `SLACK_WEBHOOK` secret to GitHub
3. Receive deployment notifications in Slack!

**Email Notifications:**

1. Go to your GitHub profile → Settings → Notifications
2. Enable email for Actions

### 3. Configure Dependabot

Already configured! Dependabot will:

- Check for dependency updates weekly
- Create PRs automatically
- Update GitHub Actions versions

### 4. Review Security Settings

1. Go to **Security** tab
2. Enable:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning
   - ✅ Code scanning

## 🔧 Common Tasks

### Deploy to Production Manually

```bash
# Via GitHub UI
1. Go to Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select environment (production/staging)
5. Click "Run workflow"

# Via GitHub CLI
gh workflow run deploy.yml -f environment=production
```

### View Test Coverage

```bash
# Local coverage
cd tripvar-server && npm run test:coverage
cd tripvar-client && npm run test:coverage

# View on GitHub
1. Go to Actions tab
2. Click on a Test Suite workflow run
3. Check the coverage report in artifacts
```

### Roll Back Deployment

```bash
# SSH into server
ssh -i ~/.ssh/github_deploy user@your-server.com

# Go to deployment directory
cd ~/tripvar-deploy

# Run rollback
./scripts/deploy.sh rollback

# Or manually revert to previous commit
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml up -d
```

### Update Environment Variables

```bash
# Update GitHub secrets
gh secret set SERVER_ENV_PROD < server-env-prod.txt

# Trigger redeployment
gh workflow run deploy.yml
```

## 📚 Workflow Files Overview

```
.github/
├── workflows/
│   ├── test.yml          # Run tests on every PR
│   ├── build.yml         # Build Docker images
│   ├── deploy.yml        # Deploy to production
│   ├── security.yml      # Security scanning
│   └── pr-checks.yml     # PR quality checks
├── dependabot.yml        # Automated dependency updates
├── CODEOWNERS            # Code review assignments
└── pull_request_template.md  # PR template
```

## 🐛 Troubleshooting

### Tests Fail in CI

```bash
# Run tests locally to debug
./scripts/run-tests.sh

# Check specific test
cd tripvar-server
npm run test:unit -- --testNamePattern="YourTestName"
```

### Deployment Fails

```bash
# Check workflow logs
gh run view --log-failed

# Test SSH connection
ssh -i ~/.ssh/github_deploy user@your-server.com

# Check server logs
ssh user@server "docker-compose logs --tail=100"
```

### Docker Build Fails

```bash
# Build locally to debug
docker build -t test-server ./tripvar-server
docker build -t test-client ./tripvar-client

# Check for errors
docker run --rm test-server npm test
```

### Secrets Not Working

```bash
# List all secrets
gh secret list

# Update a secret
gh secret set SECRET_NAME

# Verify secret is set (value will be hidden)
gh secret list | grep SECRET_NAME
```

## 📈 Pipeline Performance

**Expected Run Times:**

- Test workflow: ~5 minutes
- Build workflow: ~8 minutes
- Security workflow: ~10 minutes
- Deployment: ~3 minutes

**Total PR to Production:** ~15-20 minutes

## 🎓 Learn More

- [Complete CI/CD Documentation](./CI_CD_DOCUMENTATION.md)
- [Secrets Setup Guide](./.github/SECRETS_SETUP.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## ✅ Success Checklist

- [ ] All GitHub secrets configured
- [ ] SSH access to server working
- [ ] Test workflow passes
- [ ] Build workflow passes
- [ ] Security workflow completes
- [ ] Docker images in registry
- [ ] Branch protection enabled
- [ ] First deployment successful
- [ ] Application accessible
- [ ] Health checks passing

## 🎉 You're Done!

Your CI/CD pipeline is now active! Every push to `main` will:

1. ✅ Run all tests
2. ✅ Build Docker images
3. ✅ Scan for security issues
4. ✅ Deploy to production
5. ✅ Verify health checks
6. ✅ Send notifications

**Happy deploying! 🚀**

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or [open an issue](https://github.com/mfarsx/tripvar/issues).
