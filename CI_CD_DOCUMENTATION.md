# CI/CD Pipeline Documentation

## Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the TripVar application. The pipeline is implemented using GitHub Actions and provides automated testing, building, security scanning, and deployment.

## Table of Contents

- [Pipeline Architecture](#pipeline-architecture)
- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Required Secrets](#required-secrets)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Pipeline Architecture

The CI/CD pipeline consists of five main workflows:

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► Push/PR ──► Test Workflow ──────────────────┐
             │                                                 │
             ├──► Push/PR ──► PR Quality Checks ──────────────┤
             │                                                 │
             ├──► Push/PR ──► Security Scanning ──────────────┤
             │                                                 ├──► All Pass?
             ├──► Push (main) ──► Build Docker Images ────────┤
             │                                                 │
             └──► Push (main) ──► Deploy to Production ───────┘
                                 (Manual or Automatic)
```

## Workflows

### 1. Test Suite (`test.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

- **test-server**: Runs server-side tests

  - Linting
  - Unit tests
  - Integration tests
  - Coverage tests (minimum 70%)
  - Tests on Node.js 18.x and 20.x

- **test-client**: Runs client-side tests

  - Linting
  - Component tests
  - Coverage tests (minimum 70%)
  - Build validation
  - Tests on Node.js 18.x and 20.x

- **security-audit**: Runs npm audit
  - Server dependencies audit
  - Client dependencies audit

**Coverage Reports:**

- Uploaded to Codecov automatically
- Coverage threshold: 70%

### 2. Build Docker Images (`build.yml`)

**Triggers:**

- Push to `main` branch
- Git tags matching `v*` (e.g., v1.0.0)
- Pull requests to `main` branch (build only, no push)

**Jobs:**

- **build-server**: Builds server Docker image
- **build-client**: Builds client Docker image

**Features:**

- Multi-platform builds (linux/amd64, linux/arm64)
- Automatic tagging:
  - `latest` for main branch
  - Git SHA for traceability
  - Semantic version tags (for releases)
- Images pushed to GitHub Container Registry (ghcr.io)
- Build cache optimization

**Image Naming:**

- Server: `ghcr.io/mfarsx/tripvar-server:latest`
- Client: `ghcr.io/mfarsx/tripvar-client:latest`

### 3. Deploy to Production (`deploy.yml`)

**Triggers:**

- Push to `main` branch (automatic)
- Manual workflow dispatch

**Options:**

- Deploy to production environment
- Deploy to staging environment
- Deploy to Raspberry Pi

**Steps:**

1. Setup SSH connection to server
2. Copy deployment files
3. Copy environment variables
4. Pull latest Docker images
5. Run deployment script
6. Run health checks
7. Send notifications (Slack)

**Deployment Methods:**

- **Standard Server**: SSH-based deployment
- **Raspberry Pi**: Direct Git pull and deploy

### 4. Security Scanning (`security.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Monday at 9 AM UTC)

**Jobs:**

- **dependency-scan**: Scans npm dependencies
- **code-scanning**: CodeQL security analysis
- **docker-scan**: Trivy container vulnerability scanning
- **secret-scan**: TruffleHog secret detection

**Security Reports:**

- Uploaded to GitHub Security tab
- SARIF format for compatibility
- Critical and high severity issues highlighted

### 5. PR Quality Checks (`pr-checks.yml`)

**Triggers:**

- Pull request opened, synchronized, or reopened

**Checks:**

- **PR size check**: Warns if PR is too large
- **PR title check**: Validates conventional commits format
- **Label check**: Ensures PR has labels
- **Conflict check**: Detects merge conflicts
- **Automated comment**: Posts summary on PR

**PR Size Guidelines:**

- XS: < 100 lines (🟢)
- S: 100-300 lines (🟡)
- M: 300-500 lines (🟠)
- L: 500-1000 lines (🔴)
- XL: > 1000 lines (🔴 + warning)

## Setup Instructions

### 1. Enable GitHub Actions

1. Go to your repository settings
2. Navigate to **Actions** → **General**
3. Enable "Allow all actions and reusable workflows"
4. Save changes

### 2. Configure GitHub Container Registry

1. Go to **Settings** → **Packages**
2. Enable package creation from Actions
3. Set package visibility (public or private)

### 3. Set Up Required Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add the following secrets:

#### Deployment Secrets

```bash
# SSH credentials for production server
SSH_PRIVATE_KEY=<your-ssh-private-key>
SSH_USER=<server-username>
SERVER_HOST=<server-hostname-or-ip>

# Raspberry Pi SSH credentials (if using)
RPI_SSH_PRIVATE_KEY=<rpi-ssh-private-key>
RPI_USER=<rpi-username>
RPI_HOST=<rpi-hostname-or-ip>
RPI_DOMAIN=<your-domain.com>

# Environment files content
SERVER_ENV_PROD=<contents-of-.env.prod-for-server>
CLIENT_ENV_PROD=<contents-of-.env.prod-for-client>

# Notifications (optional)
SLACK_WEBHOOK=<slack-webhook-url>
```

#### Example: Creating SERVER_ENV_PROD Secret

The `SERVER_ENV_PROD` secret should contain the entire content of your server's production environment file:

```bash
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb://mongodb:27017/tripvar
MONGO_PASSWORD=your-secure-password
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-very-long-secure-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

### 4. Configure Branch Protection

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - Select required checks:
     - Test Server
     - Test Client
     - Security Audit
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

### 5. Set Up Environments

1. Go to **Settings** → **Environments**
2. Create environments:
   - **production**: Requires manual approval
   - **staging**: Automatic deployment

### 6. Enable Dependabot

Dependabot is already configured via `.github/dependabot.yml`. It will:

- Check for dependency updates weekly
- Create PRs for security updates
- Update GitHub Actions versions

### 7. Configure Code Owners

Code owners are defined in `.github/CODEOWNERS`. Update this file to reflect your team structure.

## Required Secrets

### SSH Keys Setup

Generate SSH key pair for deployment:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Add public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@server

# Copy private key content for GitHub secret
cat ~/.ssh/github_deploy
```

### Environment Files

Create production environment files:

**Server (.env.prod):**

```bash
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb://mongodb:27017/tripvar
MONGO_USER=admin
MONGO_PASSWORD=<generate-strong-password>
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=<generate-strong-password>
JWT_SECRET=<generate-64-char-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Client (.env.prod):**

```bash
VITE_API_URL=https://yourdomain.com/api/v1
VITE_WS_URL=wss://yourdomain.com
VITE_ENV=production
```

### Generate Secure Passwords

```bash
# Generate MongoDB password
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 32

# Generate JWT secret (64 characters)
openssl rand -base64 48
```

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![Test Suite](https://github.com/mfarsx/tripvar/actions/workflows/test.yml/badge.svg)
![Build](https://github.com/mfarsx/tripvar/actions/workflows/build.yml/badge.svg)
![Security](https://github.com/mfarsx/tripvar/actions/workflows/security.yml/badge.svg)
```

## Best Practices

### 1. Pull Request Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat(scope): add new feature"

# Push to GitHub
git push origin feature/your-feature

# Create PR and wait for CI checks
```

### 2. Commit Message Format

Follow Conventional Commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test updates
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes

### 3. Testing Before Push

```bash
# Run tests locally
./scripts/run-tests.sh

# Run specific tests
cd tripvar-server && npm run test:unit
cd tripvar-client && npm run test:run

# Check coverage
cd tripvar-server && npm run test:coverage
cd tripvar-client && npm run test:coverage
```

### 4. Docker Image Management

```bash
# Pull latest images
docker pull ghcr.io/mfarsx/tripvar-server:latest
docker pull ghcr.io/mfarsx/tripvar-client:latest

# Pull specific version
docker pull ghcr.io/mfarsx/tripvar-server:v1.0.0

# List all versions
docker images ghcr.io/mfarsx/tripvar-server
```

### 5. Monitoring Deployments

```bash
# Watch GitHub Actions
gh run watch

# View recent runs
gh run list --workflow=deploy.yml

# View specific run
gh run view <run-id>
```

## Troubleshooting

### Tests Failing in CI but Pass Locally

**Possible causes:**

1. Environment differences
2. Missing dependencies
3. Timezone issues
4. Database state

**Solutions:**

```bash
# Match CI environment
export NODE_ENV=test

# Clear caches
npm ci

# Run in clean environment
docker-compose down -v
docker-compose up -d
npm test
```

### Docker Build Failures

**Check Docker logs:**

```bash
# View build logs
docker build -t test-server ./tripvar-server

# Check for issues
docker run --rm test-server npm test
```

**Common issues:**

- Missing dependencies in Dockerfile
- Wrong base image version
- File permissions
- Build context too large

### Deployment Failures

**Debug deployment:**

```bash
# SSH into server
ssh user@server

# Check Docker status
docker ps -a
docker-compose logs

# Check disk space
df -h

# Check memory
free -h
```

**Common issues:**

- SSH key mismatch
- Insufficient disk space
- Port conflicts
- Environment variable errors

### Security Scan Issues

**View security findings:**

1. Go to **Security** tab in GitHub
2. Select **Code scanning** or **Dependabot**
3. Review and fix issues

**Update vulnerable dependencies:**

```bash
# Update server dependencies
cd tripvar-server
npm audit fix

# Update client dependencies
cd tripvar-client
npm audit fix

# Update to latest versions
npm update
```

### Secret Scan Alerts

**If secrets are detected:**

1. Immediately revoke the exposed secret
2. Generate new secret
3. Update in GitHub Secrets
4. Update on deployment servers
5. Force push to remove from history (if needed)

```bash
# Remove secret from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/file' \
  --prune-empty --tag-name-filter cat -- --all
```

## Performance Optimization

### Caching

Workflows use caching to speed up builds:

- npm dependencies
- Docker layers
- Build artifacts

### Parallel Jobs

Jobs run in parallel when possible:

- Server and client tests run simultaneously
- Build jobs run in parallel
- Security scans run in parallel

### Conditional Execution

- Deployment only runs on `main` branch
- Security scans run on schedule
- Docker builds skip on PRs

## Monitoring and Notifications

### GitHub Notifications

Enable notifications for:

- Workflow failures
- Deployment status
- Security alerts

### Slack Integration (Optional)

Configure Slack webhook for deployment notifications:

1. Create Slack webhook
2. Add to GitHub secrets as `SLACK_WEBHOOK`
3. Receive notifications on deployments

### Email Notifications

GitHub sends email notifications for:

- Failed workflow runs
- Security vulnerabilities
- Deployment failures

## Cost Optimization

GitHub Actions is free for public repositories. For private repositories:

**Usage limits (free tier):**

- 2,000 minutes/month
- 500 MB storage

**Cost reduction tips:**

1. Use caching aggressively
2. Run expensive jobs only on `main`
3. Use matrix strategy wisely
4. Cancel redundant runs
5. Optimize Docker builds

## Migration Guide

### From Manual Deployment

1. Test workflows on a feature branch
2. Verify all secrets are configured
3. Do a test deployment to staging
4. Monitor the first production deployment
5. Keep manual scripts as backup

### From Other CI/CD Platforms

1. Map existing jobs to GitHub Actions
2. Convert environment variables to secrets
3. Update Docker registry references
4. Test thoroughly before switching

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Support

For issues or questions:

1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check the troubleshooting section
4. Open an issue in the repository

---

**Last Updated:** October 22, 2025
**Maintained By:** mfarsx
