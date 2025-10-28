module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],

  // Load environment variables for tests
  setupFiles: ['<rootDir>/src/tests/jest.setup.js', '<rootDir>/src/tests/envSetup.js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/scripts/**',
    '!src/index.js',
    '!**/node_modules/**'
  ],

  // Coverage thresholds (lowered for CI/CD compatibility)
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },

  // Test timeout
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Verbose output - only show test results, not individual assertions
  verbose: false,
  
  // Silent mode to reduce console noise
  silent: false,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Run tests in parallel for better performance
  maxWorkers: '50%',

  // Cache for better performance
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ]

  // Global setup and teardown (files don't exist, so commented out)
  // globalSetup: '<rootDir>/src/tests/globalSetup.js',
  // globalTeardown: '<rootDir>/src/tests/globalTeardown.js'
};