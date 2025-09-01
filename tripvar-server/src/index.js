const app = require("./app");
const { info, error } = require("./utils/logger");
const config = require("./config");

// Global error handlers
process.on("uncaughtException", (err) => {
  error("Uncaught Exception", { 
    error: err.message,
    stack: config.server.isDevelopment ? err.stack : undefined
  });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  error("Unhandled Rejection", { 
    error: err.message,
    stack: config.server.isDevelopment ? err.stack : undefined
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(config.server.port, config.server.host, () => {
  info(`Server is running`, {
    port: config.server.port,
    host: config.server.host,
    nodeEnv: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
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
