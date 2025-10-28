# GitHub Actions Workflows

Simple and clean CI/CD workflows for TripVar.

## 📋 Workflows Overview

### 1. `test.yml` - Test Suite

**Trigger:** Push/PR to `main`

Runs automated tests:

- Server tests (`npm test`)
- Client tests (`npm run test:run`)
- Client build validation

### 2. `build.yml` - Docker Build

**Trigger:** Push to `main`

Builds and publishes Docker images:

- Server image → `ghcr.io/mfarsx/trip-var-server:latest`
- Client image → `ghcr.io/mfarsx/trip-var-client:latest`

### 3. `security.yml` - Security Scan

**Trigger:** Push/PR to `main` + Weekly (Mondays 9 AM)

Scans dependencies for vulnerabilities:

- Server: `npm audit`
- Client: `npm audit`

### 4. `pr-checks.yml` - PR Quality

**Trigger:** Every PR

Validates PR quality:

- Size check (warns if >1000 lines)
- Title format validation (conventional commits)
- Basic PR info logging

### 5. `deploy.yml` - Manual Deploy

**Trigger:** Manual via Actions tab

Deploys to production:

- SSH to server
- Pull latest code
- Deploy with docker-compose
- Run health check

## 🔐 Required Secrets

Configure these in: **Settings → Secrets and variables → Actions**

| Secret            | Description                       | Example         |
| ----------------- | --------------------------------- | --------------- |
| `SSH_PRIVATE_KEY` | SSH private key for server access | `-----BEGIN...` |
| `SSH_USER`        | Username for SSH                  | `ubuntu`        |
| `SERVER_HOST`     | Server hostname or IP             | `example.com`   |

## 🚀 Usage

### Run Tests

Tests run automatically on every PR and push to main.

### Deploy to Production

1. Go to **Actions** tab
2. Click **Deploy** workflow
3. Click **Run workflow**
4. Select **production** or **staging**
5. Click **Run workflow**

### View Workflow Status

Visit: https://github.com/mfarsx/trip-var/actions

## 📊 Workflow Badges

Add to README:

```markdown
![Tests](https://github.com/mfarsx/trip-var/actions/workflows/test.yml/badge.svg)
![Build](https://github.com/mfarsx/trip-var/actions/workflows/build.yml/badge.svg)
![Security](https://github.com/mfarsx/trip-var/actions/workflows/security.yml/badge.svg)
```

## 🛠️ Customization

### Change Node Version

Edit the `node-version` in `test.yml`:

```yaml
node-version: "20.x" # Change to 18.x, 22.x, etc.
```

### Change Docker Registry

Edit `REGISTRY` in `build.yml`:

```yaml
REGISTRY: ghcr.io # Change to docker.io, etc.
```

### Modify Test Commands

Edit test steps in `test.yml`:

```yaml
- name: Run tests
  run: npm test # Change to your test command
```

## 📝 Notes

- All workflows are designed to be simple and maintainable
- No complex matrix strategies or external services required
- Minimal secrets needed
- Fast execution times
- Clear, readable YAML

## 🆘 Troubleshooting

### Tests Failing?

```bash
# Run tests locally first
cd tripvar-server && npm test
cd tripvar-client && npm run test:run
```

### Build Failing?

```bash
# Test Docker build locally
docker build -t test-server ./tripvar-server
docker build -t test-client ./tripvar-client
```

### Deploy Failing?

- Check SSH_PRIVATE_KEY secret is correct
- Verify SERVER_HOST is accessible
- Test SSH: `ssh USER@HOST`
- Check server has Docker installed

## 📚 Learn More

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
