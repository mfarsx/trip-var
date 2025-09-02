const dotenv = require('dotenv');
const path = require('path');
const { validateEnvironment } = require('../utils/envValidator');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.prod'
  : process.env.NODE_ENV === 'test'
    ? '.env.test'
    : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Validate environment variables
validateEnvironment();

// Configuration object
const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 8000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT, 10) || 5000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT, 10) || 45000
    }
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'tripvar',
    audience: process.env.JWT_AUDIENCE || 'tripvar-users'
  },

  // Security configuration
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'],
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    authRateLimitMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 5,
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
  },

  // SSL/TLS configuration
  ssl: {
    enabled: process.env.SSL_ENABLED === 'true',
    certPath: process.env.SSL_CERT_PATH,
    keyPath: process.env.SSL_KEY_PATH
  },

  // Monitoring configuration
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 30000,
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    sentryDsn: process.env.SENTRY_DSN
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES
      ? process.env.ALLOWED_MIME_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // Email configuration
  email: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@tripvar.com'
  },

  // External APIs configuration
  externalApis: {
    timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT, 10) || 10000,
    retries: parseInt(process.env.EXTERNAL_API_RETRIES, 10) || 3,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY
  }
};

// Validate configuration
const validateConfig = () => {
  const errors = [];

  // Validate JWT secret strength
  if (config.jwt.secret && config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate MongoDB URI format
  if (!config.database.uri.startsWith('mongodb://') && !config.database.uri.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }

  // Validate SSL configuration in production
  if (config.server.isProduction && config.ssl.enabled) {
    if (!config.ssl.certPath || !config.ssl.keyPath) {
      errors.push('SSL certificate and key paths must be provided in production');
    }
  }

  if (errors.length > 0) {
    // Use process.stderr for critical startup errors before logger is available
    process.stderr.write('Configuration validation errors:\n');
    errors.forEach(error => process.stderr.write(`- ${error}\n`));
    process.exit(1);
  }
};

// Run validation
validateConfig();

module.exports = config;