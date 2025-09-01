module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/tripvar'
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    url: process.env.REDIS_URL || 'redis://redis:6379'
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'debug'
  }
};
