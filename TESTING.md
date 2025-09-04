# Testing Guide for Tripvar

This document provides comprehensive information about the testing setup, strategies, and best practices for the Tripvar application.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Pipeline](#cicd-pipeline)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Tripvar uses a comprehensive testing strategy that includes:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test the interaction between different parts of the system
- **End-to-End Tests**: Test complete user workflows
- **Security Tests**: Audit dependencies for vulnerabilities
- **Performance Tests**: Load testing and performance monitoring

### Test Frameworks

- **Server**: Jest with Supertest for API testing
- **Client**: Vitest with React Testing Library
- **E2E**: Jest with Supertest for API integration
- **Security**: npm audit and Snyk
- **Performance**: Artillery for load testing

## Test Structure

### Server Tests (`tripvar-server/src/tests/`)

```
src/tests/
├── setup.js              # Test utilities and setup
├── mockRedis.js          # Redis mocking for tests
├── auth.test.js          # Authentication tests
├── booking.test.js       # Booking functionality tests
├── destination.test.js   # Destination management tests
└── integration.test.js   # End-to-end workflow tests
```

### Client Tests (`tripvar-client/src/`)

```
src/
├── test/
│   └── setup.js          # Test setup and mocks
├── pages/__tests__/
│   ├── Login.test.jsx    # Login page tests
│   └── Register.test.jsx # Registration page tests
└── services/__tests__/
    └── api.test.js       # API service tests
```

## Running Tests

### Prerequisites

- Node.js 18 or later
- npm or yarn
- MongoDB (for server tests)
- Redis (optional, mocked in tests)

### Quick Start

```bash
# Run all tests
./scripts/run-tests.sh

# Run specific test suites
./scripts/run-tests.sh server
./scripts/run-tests.sh client
./scripts/run-tests.sh security
```

### Server Tests

```bash
cd tripvar-server

# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:booking
npm run test:destination
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Client Tests

```bash
cd tripvar-client

# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

### Individual Test Files

```bash
# Server
npm test -- auth.test.js
npm test -- booking.test.js
npm test -- destination.test.js

# Client
npm test -- Login.test.jsx
npm test -- api.test.js
```

## Test Coverage

### Coverage Thresholds

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Summary**: `coverage/coverage-summary.json`

### Viewing Coverage

```bash
# Server coverage
cd tripvar-server
npm run test:coverage
open coverage/lcov-report/index.html

# Client coverage
cd tripvar-client
npm run test:coverage
open coverage/lcov-report/index.html
```

## CI/CD Pipeline

### GitHub Actions Workflows

#### Test Workflow (`.github/workflows/test.yml`)

Runs on every push and pull request:

1. **Server Tests**: Unit, integration, and coverage tests
2. **Client Tests**: Component and service tests
3. **E2E Tests**: End-to-end workflow tests
4. **Security Tests**: Dependency vulnerability scanning
5. **Performance Tests**: Load testing with Artillery

#### Deploy Workflow (`.github/workflows/deploy.yml`)

Runs on main branch pushes:

1. **Build and Test**: Run all tests before deployment
2. **Build Images**: Create Docker images for server and client
3. **Deploy to Staging**: Deploy to staging environment
4. **Deploy to Production**: Deploy to production (manual trigger)
5. **Health Checks**: Verify deployment success

### Local CI Simulation

```bash
# Run the same tests as CI
./scripts/run-tests.sh all

# Check security
npm audit --audit-level moderate

# Run load tests (requires server running)
artillery run load-test.yml
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should clearly describe what is being tested
3. **Test Edge Cases**: Include tests for error conditions and boundary values
4. **Mock External Dependencies**: Use mocks for databases, APIs, and external services
5. **Keep Tests Independent**: Each test should be able to run in isolation

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to group related tests
2. **Use Setup and Teardown**: Clean up after each test
3. **Share Test Utilities**: Create reusable helper functions
4. **Maintain Test Data**: Use factories for creating test data

### Performance

1. **Run Tests in Parallel**: Use Jest's parallel execution
2. **Mock Heavy Operations**: Mock database operations and API calls
3. **Use In-Memory Databases**: Use MongoDB Memory Server for tests
4. **Clean Up Resources**: Properly close connections and clean up

### Security

1. **Regular Audits**: Run `npm audit` regularly
2. **Update Dependencies**: Keep dependencies up to date
3. **Test Authentication**: Include tests for auth flows
4. **Validate Input**: Test input validation and sanitization

## Troubleshooting

### Common Issues

#### Tests Failing Due to Database Connection

```bash
# Ensure MongoDB is running
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 mongo:7.0
```

#### Redis Connection Errors

Redis is mocked in tests, but if you see connection errors:

```bash
# Check if Redis is running
redis-cli ping

# Or start Redis
brew services start redis
```

#### Coverage Below Threshold

```bash
# Check current coverage
npm run test:coverage

# Add more tests to increase coverage
# Focus on uncovered lines in the coverage report
```

#### Slow Tests

```bash
# Run tests in parallel
npm test -- --maxWorkers=4

# Use watch mode for development
npm run test:watch
```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with debug
npm test -- --verbose auth.test.js
```

### Test Environment Variables

Create `.env.test` files for test-specific configuration:

```bash
# tripvar-server/.env.test
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/tripvar-test
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-jwt-secret-key-for-testing-only

# tripvar-client/.env.test
NODE_ENV=test
VITE_API_URL=http://localhost:8000
```

## Test Data Management

### Test Factories

Use the test utilities in `setup.js` to create test data:

```javascript
// Create test user
const user = await createTestUser({
  email: 'test@example.com',
  name: 'Test User'
});

// Create test destination
const destination = await createTestDestination({
  title: 'Test Destination',
  category: 'Beach'
});

// Create test booking
const booking = await createTestBooking({
  userId: user._id,
  destinationId: destination._id
});
```

### Database Cleanup

Tests automatically clean up the database between runs:

```javascript
beforeEach(async () => {
  await clearDatabase();
});
```

## Contributing

When adding new features:

1. **Write Tests First**: Follow TDD principles
2. **Update Test Documentation**: Document new test patterns
3. **Maintain Coverage**: Ensure new code is covered by tests
4. **Run Full Test Suite**: Verify all tests pass before submitting

### Adding New Test Files

1. Create test file with `.test.js` or `.test.jsx` extension
2. Follow naming convention: `feature.test.js`
3. Import test utilities from `setup.js`
4. Add to appropriate test script in `package.json`

### Test Review Checklist

- [ ] Tests cover happy path and error cases
- [ ] Tests are independent and can run in any order
- [ ] Tests use appropriate mocks and stubs
- [ ] Test names clearly describe what is being tested
- [ ] Coverage threshold is maintained
- [ ] No hardcoded values or test data pollution

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)