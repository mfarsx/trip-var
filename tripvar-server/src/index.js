const app = require('./app');
const { info, error, warn } = require('./utils/logger');
const config = require('./config/config');
const websocketService = require('./services/websocketService');

// Global error handlers
process.on('uncaughtException', (err) => {
  error('Uncaught Exception', {
    error: err.message,
    stack: config.server.isDevelopment ? err.stack : undefined
  });
  // In production, we should exit for uncaught exceptions
  if (config.server.isProduction) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  error('Unhandled Rejection', {
    error: err.message,
    stack: config.server.isDevelopment ? err.stack : undefined
  });

  // Don't exit for validation errors - they should be handled by middleware
  if (err.name === 'ValidationError' || err.message.includes('Validation failed')) {
    warn('Validation error caught as unhandled rejection - this should be handled by middleware', {
      error: err.message
    });
    return;
  }

  // For other unhandled rejections, still exit in production
  if (config.server.isProduction) {
    process.exit(1);
  } else {
    warn('Unhandled rejection in development - server continues running', {
      error: err.message
    });
  }
});

// Graceful shutdown handler
const gracefulShutdown = async(signal) => {
  info(`${signal} received, shutting down gracefully`);

  try {
    // Close server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          info('HTTP server closed');
          resolve();
        });
      });
    }

    // Close database connections
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      info('Database connection closed');
    }

    // Close Redis connection
    const redis = require('./config/redis');
    if (redis && redis.disconnect) {
      await redis.disconnect();
      info('Redis connection closed');
    }

    // Close WebSocket server
    websocketService.close();

    info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    error('Error during graceful shutdown', { error: err.message });
    process.exit(1);
  }
};

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(config.server.port, config.server.host, () => {
  info('🚀 Tripvar Server is running', {
    port: config.server.port,
    host: config.server.host,
    nodeEnv: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    pid: process.pid
  });

  // Initialize WebSocket server
  websocketService.initialize(server);

  // Display startup information
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Tripvar Server Started Successfully!');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://${config.server.host}:${config.server.port}`);
  console.log(`🔌 WebSocket: ws://${config.server.host}:${config.server.port}/ws`);
  console.log(`📚 API Docs: http://${config.server.host}:${config.server.port}/api-docs`);
  console.log(`❤️  Health: http://${config.server.host}:${config.server.port}/health`);
  console.log(`🌍 Environment: ${config.server.nodeEnv}`);
  console.log(`🆔 Process ID: ${process.pid}`);
  console.log('='.repeat(50) + '\n');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    error(`Port ${config.server.port} is already in use`);
  } else {
    error('Server error', { error: err.message });
  }
  process.exit(1);
});

module.exports = server;
