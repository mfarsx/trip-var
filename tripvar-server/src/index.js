// Enhanced error handling for startup
process.on('uncaughtException', (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION - Server will exit:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

let app, config, websocketService;

try {
  app = require('./app');
  const { info, error, warn } = require('./utils/logger');
  config = require('./config/config');
  websocketService = require('./services/websocketService');

  // Import connection modules
  const mongoose = require('mongoose');
  const redis = require('./config/redis');
} catch (err) {
  console.error('🚨 FAILED TO LOAD MODULES:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
}

// Get logger functions after successful module loading
const { info, error, warn } = require('./utils/logger');

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
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
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      info('Database connection closed');
    }

    // Close Redis connection
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

// Create startup banner
const createStartupBanner = () => {
  const banner = `
╔══════════════════════════════════════════════════════════╗
║                    🚀 TRIPVAR SERVER                    ║
║                                                          ║
║  📡 Server:    http://${config.server.host}:${config.server.port}${' '.repeat(20 - config.server.port.toString().length)}║
║  🔌 WebSocket: ws://${config.server.host}:${config.server.port}/ws${' '.repeat(18 - config.server.port.toString().length)}║
║  📚 API Docs:  http://${config.server.host}:${config.server.port}/api-docs${' '.repeat(12 - config.server.port.toString().length)}║
║  ❤️  Health:    http://${config.server.host}:${config.server.port}/health${' '.repeat(13 - config.server.port.toString().length)}║
║  🌍 Environment: ${config.server.nodeEnv}${' '.repeat(32 - config.server.nodeEnv.length)}║
║  🆔 Process ID: ${process.pid}${' '.repeat(33 - process.pid.toString().length)}║
║  ⏰ Started:    ${new Date().toISOString()}${' '.repeat(8)}║
╚══════════════════════════════════════════════════════════╝
`;
  return banner;
};

// Start server with enhanced error handling
let server;
try {
  server = app.listen(config.server.port, config.server.host, () => {
    info('🚀 Tripvar Server is running', {
      port: config.server.port,
      host: config.server.host,
      nodeEnv: config.server.nodeEnv,
      timestamp: new Date().toISOString(),
      pid: process.pid
    });

    // Initialize WebSocket server
    try {
      websocketService.initialize(server);
    } catch (wsError) {
      console.error('🚨 FAILED TO INITIALIZE WEBSOCKET:', wsError.message);
      console.error('Stack trace:', wsError.stack);
    }

    // Display startup banner
    console.log(createStartupBanner());
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('🚨 SERVER ERROR:', err.message);
    console.error('Error code:', err.code);
    console.error('Stack trace:', err.stack);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${config.server.port} is already in use`);
    } else {
      console.error('❌ Server failed to start');
    }
    process.exit(1);
  });

} catch (startupError) {
  console.error('🚨 FAILED TO START SERVER:', startupError.message);
  console.error('Stack trace:', startupError.stack);
  process.exit(1);
}

module.exports = server;
