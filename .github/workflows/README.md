# CI/CD Pipeline Documentation

This directory contains the GitHub Actions workflows for the Tripvar project.

## Workflow Overview

### 1. Test Suite (`.github/workflows/test.yml`)
**Triggers:** Push to main, PR events  
**Purpose:** Runs unit and integration tests for both server and client

- **test-server**: Runs Jest tests for the backend
- **test-client**: Runs Vitest tests and builds the frontend

Both jobs run in parallel on every push and pull request.

### 2. Security Scan (`.github/workflows/security.yml`)
**Triggers:** Push to main, PR events, Weekly schedule (Mondays 9 AM UTC)  
**Purpose:** Audits dependencies for known vulnerabilities

- Runs `npm audit` on both server and client
- Does not fail the workflow if vulnerabilities are found (warning only)
- Scheduled to run weekly for proactive security monitoring

### 3. Build Images (`.github/workflows/build.yml`)
**Triggers:** Push to main (after tests pass), Manual dispatch  
**Purpose:** Builds and pushes Docker images to GitHub Container Registry (GHCR)

- Builds production Docker images for both server and client
- Pushes images with tags: `latest`, branch name, and commit SHA
- Uses build caching for faster builds
- Images are stored at `ghcr.io/<repo>-server` and `ghcr.io/<repo>-client`

### 4. PR Quality Check (`.github/workflows/pr-checks.yml`)
**Triggers:** PR opened, synchronized, or reopened  
**Purpose:** Validates pull request quality

- Checks PR size (warns if > 1000 lines)
- Validates PR title follows Conventional Commits format
- Provides feedback without blocking merge

### 5. Deploy (`.github/workflows/deploy.yml`)
**Triggers:** Manual dispatch only  
**Purpose:** Deploys the application to production or staging

- **Manual deployment** - requires selecting environment
- Pulls pre-built images from GHCR (no building on server)
- Updates containers on the target server
- Runs health checks after deployment
- Supports both `production` and `staging` environments

## Required Secrets

### For Deployment
The following secrets must be configured in GitHub repository settings:

- `SSH_PRIVATE_KEY`: Private SSH key for server access
- `SSH_USER`: SSH username for server access  
- `SERVER_HOST`: IP address or domain of the deployment server

### Automatic Secrets
The following are automatically provided by GitHub Actions:
- `GITHUB_TOKEN`: Automatically provided for GHCR authentication

## Docker Image Strategy

### Build Process
1. Images are built in GitHub Actions during push to main
2. Images are pushed to GitHub Container Registry (GHCR)
3. Images are tagged with: `latest`, commit SHA, and branch name

### Deployment Process
1. Manual trigger of deploy workflow
2. SSH into deployment server
3. Pull latest images from GHCR
4. Deploy using `docker-compose.ghcr.yml`
5. Health check verification

## Docker Compose Files

- `docker-compose.yml`: Development environment (builds locally)
- `docker-compose.prod.yml`: Production builds from local source
- `docker-compose.ghcr.yml`: Production pulls images from GHCR

## Typical Workflow

### For Code Changes
1. Developer creates a branch and pushes code
2. **test.yml** runs automatically on push/PR
3. **security.yml** runs automatically on push/PR
4. **pr-checks.yml** runs on PR events
5. After PR merge to main:
   - **test.yml** runs tests
   - **security.yml** runs security audit
   - **build.yml** builds and pushes Docker images to GHCR

### For Deployment
1. Admin manually triggers **deploy.yml**
2. Selects environment (production/staging)
3. Workflow:
   - SSHs to target server
   - Pulls latest images from GHCR
   - Updates containers
   - Verifies health checks

## Best Practices

1. **Always run tests before deployment**: Test workflow runs on every push
2. **Security first**: Security audit runs weekly and on PRs
3. **Manual deployments**: Deploy only when you're ready
4. **Image versioning**: Images are tagged with commit SHAs for traceability
5. **Health checks**: Deployment includes automatic health verification

## Troubleshooting

### Build fails
- Check test outputs in test.yml workflow
- Ensure all dependencies are up to date
- Review Dockerfile for any build issues

### Deployment fails
- Verify SSH secrets are correctly configured
- Check server has Docker and Docker Compose installed
- Ensure server has network access to GHCR

### Security audit warnings
- Review reported vulnerabilities
- Update dependencies if needed
- Security scan doesn't block deployment but should be monitored
