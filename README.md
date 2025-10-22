# TripVar - Modern Travel Planning Application

![React Version](https://img.shields.io/badge/react-18.3.1-blue)
![Node Version](https://img.shields.io/badge/node-18.x-green)
![License](https://img.shields.io/badge/License-MIT-orange)
![MongoDB](https://img.shields.io/badge/MongoDB-8.9.5-green)
![Redis](https://img.shields.io/badge/Redis-alpine-blue)

[![Test Suite](https://github.com/mfarsx/tripvar/actions/workflows/test.yml/badge.svg)](https://github.com/mfarsx/tripvar/actions/workflows/test.yml)
[![Build](https://github.com/mfarsx/tripvar/actions/workflows/build.yml/badge.svg)](https://github.com/mfarsx/tripvar/actions/workflows/build.yml)
[![Security](https://github.com/mfarsx/tripvar/actions/workflows/security.yml/badge.svg)](https://github.com/mfarsx/tripvar/actions/workflows/security.yml)
[![Deploy](https://github.com/mfarsx/tripvar/actions/workflows/deploy.yml/badge.svg)](https://github.com/mfarsx/tripvar/actions/workflows/deploy.yml)

A full-stack travel planning application built with modern web technologies, featuring destination discovery, booking management, and user authentication.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server │◄──►│   MongoDB       │
│   (Port 5173)   │    │   (Port 8000)   │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Port 6379)   │
                       └─────────────────┘
```

## 🚀 Features

### Frontend (React + Vite)

- **Modern UI**: Built with React 18.3.1 and Vite 6.0.5
- **State Management**: Redux Toolkit for global state management
- **Styling**: Tailwind CSS for responsive design
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Heroicons and React Icons
- **Routing**: React Router DOM v7
- **Notifications**: React Hot Toast for user feedback
- **UI Components**: Headless UI for accessible components

### Backend (Node.js + Express)

- **RESTful API**: Express.js with comprehensive routing
- **Authentication**: JWT-based authentication with bcryptjs
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session and data caching
- **Logging**: Winston and Morgan for comprehensive logging
- **Middleware**: CORS, cookie parsing, and error handling
- **Health Checks**: Built-in health monitoring endpoints

### Infrastructure

- **Containerization**: Docker and Docker Compose
- **Database**: MongoDB with persistent storage
- **Caching**: Redis with AOF persistence
- **Health Monitoring**: Service health checks and logging
- **Development**: Hot reloading for both client and server

## 📦 Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- Git

### Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tripvar
   ```

2. **Start all services**

   ```bash
   docker-compose up --build
   ```

3. **Check service status and URLs**

   ```bash
   # After docker compose up, run this to see all service URLs
   ./scripts/show-status.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api-docs
   - Health Check: http://localhost:8000/health
   - MongoDB: localhost:27017
   - Redis: localhost:6379

### Manual Setup

#### Backend Setup

```bash
cd tripvar-server
npm install
npm run dev
```

#### Frontend Setup

```bash
cd tripvar-client
npm install
npm run dev
```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env in tripvar-server/)

```bash
# Server Configuration
NODE_ENV=development
PORT=8000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/tripvar

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug
DEBUG=true
```

#### Frontend (.env in tripvar-client/)

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_PATH=/api/v1
VITE_HOST=0.0.0.0

# Environment
NODE_ENV=development
```

## 🗄️ Database

The application uses MongoDB as the primary database with the following collections:

- **Users**: User authentication and profile data
- **Destinations**: Travel destination information
- **Bookings**: User booking records

### Seeding Data

```bash
cd tripvar-server
npm run seed
```

## 🐳 Docker Services

- **mongodb**: MongoDB database with persistent storage
- **redis**: Redis cache with AOF persistence
- **server**: Express.js API server
- **client**: React development server

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# Check service status and URLs
./scripts/show-status.sh

# View specific service logs
./scripts/logs.sh logs server
./scripts/logs.sh logs client
./scripts/logs.sh logs mongodb
./scripts/logs.sh logs redis
```

## 📚 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Destinations

- `GET /api/v1/destinations` - List all destinations
- `GET /api/v1/destinations/:id` - Get destination details

### Bookings

- `GET /api/v1/bookings` - User bookings
- `POST /api/v1/bookings` - Create new booking
- `PUT /api/v1/bookings/:id` - Update booking

### Health

- `GET /api/v1/health` - API health status
- `GET /api/v1/health/db` - Database health check

## 🧪 Development

### Available Scripts

#### Backend

```bash
npm run dev      # Start development server with nodemon
npm run start    # Start production server
npm run test     # Run tests
npm run lint     # Run ESLint
npm run seed     # Seed database with sample data
```

#### Frontend

```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Quality

- **ESLint**: Code linting for both client and server
- **Prettier**: Code formatting (configured via Tailwind)
- **TypeScript**: Type definitions for React components

## 🚀 Deployment

### Development

```bash
# Start development environment
docker-compose up --build
```

### Production Deployment

For production deployment, see our comprehensive [Production Deployment Guide](PRODUCTION.md).

**Quick Production Setup:**

```bash
# 1. Configure environment files
cp tripvar-server/.env.example tripvar-server/.env.prod
cp tripvar-client/.env.example tripvar-client/.env.prod

# 2. Edit production environment variables
nano tripvar-server/.env.prod
nano tripvar-client/.env.prod

# 3. Deploy to production
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy
```

**Production Features:**

- ✅ SSL/HTTPS support
- ✅ Security hardening (Helmet, Rate Limiting, CORS)
- ✅ Enhanced logging and monitoring
- ✅ Health checks and metrics
- ✅ Automated backups
- ✅ CI/CD pipeline
- ✅ Performance optimizations
- ✅ Database connection pooling
- ✅ Redis caching
- ✅ Docker multi-stage builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and ESLint rules
- Write meaningful commit messages
- Test your changes before submitting
- Update documentation as needed

## 🔄 CI/CD Pipeline

This project features a comprehensive CI/CD pipeline powered by GitHub Actions.

### Automated Workflows

- **Test Suite**: Runs unit tests, integration tests, and coverage reports on every PR
- **Build**: Builds and pushes Docker images to GitHub Container Registry
- **Security Scanning**: Automated vulnerability scanning with CodeQL, Trivy, and TruffleHog
- **Deployment**: Automated deployment to production on merge to main
- **PR Quality Checks**: Validates PR size, title format, and code quality

### Quick Start

1. **Setup CI/CD** (15 minutes)

   ```bash
   # See the quick start guide
   cat CI_CD_QUICK_START.md
   ```

2. **Configure Secrets** (5 minutes)

   ```bash
   # Follow the secrets setup guide
   cat .github/SECRETS_SETUP.md
   ```

3. **Deploy**
   ```bash
   # Merge to main triggers automatic deployment
   git push origin main
   ```

### Documentation

- 📘 [Complete CI/CD Documentation](CI_CD_DOCUMENTATION.md)
- 🚀 [Quick Start Guide](CI_CD_QUICK_START.md)
- 🔐 [Secrets Setup Guide](.github/SECRETS_SETUP.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact & Support

- **Project Maintainer**: [Mfarsx](mailto:mfarsx@tripvar.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/mfarsx/tripvar/issues)
- **Documentation**: Check the codebase for detailed API documentation

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for better travel planning experiences
- Community contributions and feedback are welcome
