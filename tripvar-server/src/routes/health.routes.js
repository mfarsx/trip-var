const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');
// const { HealthChecker, createHealthCheckMiddleware, createReadinessMiddleware, createLivenessMiddleware, createMetricsMiddleware } = require('../middleware/healthCheck');

const config = require('../config/config');
const os = require('os');
const process = require('process');

// Initialize health checker
let healthChecker;
let redisClient;

// Initialize health checker without Redis initially
// healthChecker = new HealthChecker(null); // HealthChecker not implemented yet

// Metrics middleware
// const metricsMiddleware = createMetricsMiddleware(); // Metrics middleware not implemented yet

// Basic health check
router.get('/', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tripvar-server',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.nodeEnv,
    uptime: process.uptime()
  };
  
  res.json(health);
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.json({ status: 'ok', database: 'connected' });
    } else {
      res.status(503).json({ status: 'error', database: 'disconnected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});

// Redis health check
router.get('/redis', async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const startTime = Date.now();
    await redisClient.ping();
    const responseTime = Date.now() - startTime;
    
    res.json({ 
      status: 'ok', 
      redis: 'connected',
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      redis: 'disconnected',
      message: error.message 
    });
  }
});

// System metrics
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        free: os.freemem(),
        total: os.totalmem()
      },
      cpu: {
        loadAverage: os.loadavg(),
        cpus: os.cpus().length
      },
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      title: process.title,
      argv: process.argv,
      execPath: process.execPath
    }
  };

  res.json(metrics);
});

// Complete health check (all services)
router.get('/all', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tripvar-server',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.nodeEnv,
    uptime: process.uptime(),
    services: {},
    checks: {}
  };

  // Check MongoDB
  try {
    const dbStartTime = Date.now();
    const dbState = mongoose.connection.readyState;
    const dbResponseTime = Date.now() - dbStartTime;
    
    health.services.mongodb = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      responseTime: `${dbResponseTime}ms`,
      readyState: dbState
    };
    
    health.checks.mongodb = dbState === 1 ? 'pass' : 'fail';
    
    if (dbState !== 1) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.mongodb = {
      status: 'error',
      error: error.message
    };
    health.checks.mongodb = 'fail';
    health.status = 'error';
  }

  // Check Redis
  try {
    const redisStartTime = Date.now();
    const redisClient = getRedisClient();
    await redisClient.ping();
    const redisResponseTime = Date.now() - redisStartTime;
    
    health.services.redis = {
      status: 'connected',
      responseTime: `${redisResponseTime}ms`
    };
    
    health.checks.redis = 'pass';
  } catch (error) {
    health.services.redis = {
      status: 'disconnected',
      error: error.message
    };
    health.checks.redis = 'fail';
    health.status = 'degraded';
  }

  // System health
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  health.system = {
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      usagePercent: Math.round(memoryUsagePercent)
    },
    uptime: `${Math.round(process.uptime())}s`,
    loadAverage: os.loadavg()
  };

  // Overall response time
  health.responseTime = `${Date.now() - startTime}ms`;

  // Determine status code
  let statusCode = 200;
  if (health.status === 'error') {
    statusCode = 503;
  } else if (health.status === 'degraded') {
    statusCode = 200; // Still operational but with issues
  }

  res.status(statusCode).json(health);
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const dbState = mongoose.connection.readyState;
    
    // Check Redis if available
    let redisReady = true;
    try {
      const redisClient = getRedisClient();
      await redisClient.ping();
    } catch (redisError) {
      redisReady = false;
      // Redis is not critical for readiness, just log the warning
      console.warn('Redis not ready:', redisError.message);
    }
    
    if (dbState === 1) {
      res.status(200).json({ 
        status: 'ready',
        services: {
          database: 'ready',
          redis: redisReady ? 'ready' : 'not ready'
        }
      });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'database not connected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', reason: error.message });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  // Simple check if the process is alive
  res.status(200).json({ status: 'alive', uptime: process.uptime() });
});

module.exports = router;
