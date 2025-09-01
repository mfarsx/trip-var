# Tripvar Server

A comprehensive, production-ready Node.js API server for the Tripvar travel booking application.

## 🚀 Features

### Core Functionality
- **User Management**: Registration, authentication, profile management
- **Destination Management**: CRUD operations for travel destinations
- **Booking System**: Complete booking lifecycle management
- **Review System**: User reviews and ratings
- **Payment Integration**: Secure payment processing
- **Notification System**: Real-time notifications

### Quality & Security
- **Comprehensive Input Validation**: Advanced validation with sanitization
- **Enhanced Error Handling**: Structured error responses with proper HTTP status codes
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Security Headers**: Helmet.js security middleware
- **Rate Limiting**: Advanced rate limiting with DDoS protection
- **Audit Logging**: Comprehensive audit trails for all operations
- **Health Monitoring**: Detailed health checks and metrics

### Performance & Scalability
- **Redis Caching**: Intelligent caching for improved performance
- **Database Optimization**: Efficient MongoDB queries with proper indexing
- **Request Compression**: Gzip compression for API responses
- **Connection Pooling**: Optimized database connection management

### Development & Testing
- **Comprehensive Test Suite**: Unit and integration tests with high coverage
- **Code Quality**: ESLint configuration and best practices
- **Environment Management**: Multiple environment configurations
- **Docker Support**: Containerized deployment with Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tripvar-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services with Docker**
   ```bash
   docker-compose up -d
   ```

   Or start services manually:
   ```bash
   # Start MongoDB and Redis
   # Then start the server
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 8000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/tripvar |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |
| `LOG_LEVEL` | Logging level | info |

### Security Configuration

The server includes comprehensive security measures:

- **Rate Limiting**: Configurable rate limits for different endpoints
- **Input Validation**: Strict validation and sanitization
- **Security Headers**: Helmet.js protection
- **CORS**: Configurable cross-origin resource sharing
- **Authentication**: JWT-based authentication with refresh tokens

## 📚 API Documentation

### Swagger Documentation

Access the interactive API documentation at:
```
http://localhost:8000/api-docs
```

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PATCH /api/v1/auth/profile` - Update user profile
- `PATCH /api/v1/auth/update-password` - Update password
- `DELETE /api/v1/auth/profile` - Delete account

#### Destinations
- `GET /api/v1/destinations` - List destinations
- `GET /api/v1/destinations/:id` - Get destination details
- `POST /api/v1/destinations` - Create destination (admin)
- `PATCH /api/v1/destinations/:id` - Update destination (admin)
- `DELETE /api/v1/destinations/:id` - Delete destination (admin)

#### Bookings
- `GET /api/v1/bookings` - List user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `POST /api/v1/bookings` - Create booking
- `PATCH /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

#### Reviews
- `GET /api/v1/reviews` - List reviews
- `GET /api/v1/reviews/:id` - Get review details
- `POST /api/v1/reviews` - Create review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run unit tests only
npm run test:unit
```

### Test Structure

```
src/tests/
├── setup.js              # Test utilities and setup
├── auth.test.js          # Authentication tests
├── destinations.test.js  # Destination tests
├── bookings.test.js      # Booking tests
├── reviews.test.js       # Review tests
└── integration/          # Integration tests
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe (Kubernetes)
- `GET /health/live` - Liveness probe (Kubernetes)
- `GET /health/metrics` - Application metrics

### Metrics

The server provides comprehensive metrics including:
- Request/response statistics
- Error rates and types
- Performance metrics
- Database connection status
- Memory and CPU usage

## 🔒 Security Features

### Input Validation
- Comprehensive validation using express-validator
- XSS protection and input sanitization
- SQL injection prevention
- File upload validation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password strength requirements
- Account lockout protection

### Rate Limiting
- Endpoint-specific rate limits
- IP-based rate limiting
- Progressive rate limiting for suspicious activity
- DDoS protection

### Audit Logging
- All user actions logged
- Security event tracking
- Performance monitoring
- Error tracking and alerting

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. **Environment Setup**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=mongodb://your-mongodb-uri
   export JWT_SECRET=your-secure-jwt-secret
   ```

2. **Start Application**
   ```bash
   npm start
   ```

3. **Process Management** (recommended)
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/index.js --name tripvar-server
   ```

## 📈 Performance Optimization

### Caching Strategy
- Redis caching for frequently accessed data
- Cache invalidation on data updates
- Intelligent cache warming

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization

### Response Optimization
- Gzip compression
- Response pagination
- Efficient data serialization

## 🛠️ Development

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Adding New Features

1. **Create Model** (if needed)
   ```bash
   # Add to src/models/
   ```

2. **Create Controller**
   ```bash
   # Add to src/controllers/
   ```

3. **Create Routes**
   ```bash
   # Add to src/routes/
   ```

4. **Add Tests**
   ```bash
   # Add to src/tests/
   ```

5. **Update Documentation**
   ```bash
   # Update Swagger annotations
   ```

## 📝 API Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "meta": {
    // Pagination or other metadata
  }
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  },
  "requestId": "req_1234567890_abcdef",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the test files for usage examples

## 🔄 Changelog

### v1.0.0
- Initial release with comprehensive features
- Complete authentication system
- Destination and booking management
- Review system
- Payment integration
- Comprehensive testing suite
- API documentation
- Security enhancements
- Performance optimizations