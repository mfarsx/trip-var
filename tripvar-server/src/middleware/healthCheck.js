const mongoose = require('mongoose');
const { info, warn, error } = require('../utils/logger');
const { createError } = require('../utils/errors');

/**
 * Health check utilities
 */
class HealthChecker {
  constructor(redisClient) {
    this.redis = redisClient;
    this.checks = new Map();
    this.registerDefaultChecks();
  }

  /**
   * Register a health check
   */
  register(name, checkFunction, options = {}) {
    this.checks.set(name, {
      check: checkFunction,
      critical: options.critical || false,
      timeout: options.timeout || 5000,
      description: options.description || `Health check for ${name}`
    });
  }

  /**
   * Register default health checks
   */
  registerDefaultChecks() {
    // Database health check
    this.register('database', async () => {
      const startTime = Date.now();
      
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection not ready');
      }

      // Test database connectivity
      await mongoose.connection.db.admin().ping();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      };
    }, { critical: true, description: 'MongoDB database connectivity' });

    // Redis health check
    this.register('redis', async () => {
      if (!this.redis) {
        return {
          status: 'disabled',
          message: 'Redis not configured'
        };
      }

      const startTime = Date.now();
      
      try {
        await this.redis.ping();
        const responseTime = Date.now() - startTime;
        
        return {
          status: 'healthy',
          responseTime: `${responseTime}ms`,
          version: await this.redis.info('server').then(info => {
            const match = info.match(/redis_version:([^\r\n]+)/);
            return match ? match[1] : 'unknown';
          })
        };
      } catch (err) {
        throw new Error(`Redis connection failed: ${err.message}`);
      }
    }, { critical: false, description: 'Redis cache connectivity' });

    // Memory health check
    this.register('memory', async () => {
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal;
      const usedMem = memUsage.heapUsed;
      const usagePercent = (usedMem / totalMem) * 100;

      if (usagePercent > 90) {
        throw new Error(`High memory usage: ${usagePercent.toFixed(2)}%`);
      }

      return {
        status: 'healthy',
        heapUsed: `${Math.round(usedMem / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(totalMem / 1024 / 1024)}MB`,
        usagePercent: `${usagePercent.toFixed(2)}%`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      };
    }, { critical: true, description: 'Memory usage monitoring' });

    // CPU health check
    this.register('cpu', async () => {
      const startUsage = process.cpuUsage();
      
      // Wait a bit to measure CPU usage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endUsage = process.cpuUsage(startUsage);
      const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds

      if (cpuPercent > 80) {
        warn('High CPU usage detected', { cpuPercent });
      }

      return {
        status: 'healthy',
        cpuPercent: `${cpuPercent.toFixed(2)}%`,
        uptime: `${Math.round(process.uptime())}s`,
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : 'N/A'
      };
    }, { critical: false, description: 'CPU usage monitoring' });

    // Disk space health check
    this.register('disk', async () => {
      const fs = require('fs').promises;
      const path = require('path');
      
      try {
        const stats = await fs.statfs('/');
        const total = stats.bavail * stats.bsize;
        const free = stats.bavail * stats.bsize;
        const used = (stats.blocks - stats.bavail) * stats.bsize;
        const usagePercent = (used / (used + free)) * 100;

        if (usagePercent > 90) {
          throw new Error(`High disk usage: ${usagePercent.toFixed(2)}%`);
        }

        return {
          status: 'healthy',
          total: `${Math.round(total / 1024 / 1024 / 1024)}GB`,
          free: `${Math.round(free / 1024 / 1024 / 1024)}GB`,
          used: `${Math.round(used / 1024 / 1024 / 1024)}GB`,
          usagePercent: `${usagePercent.toFixed(2)}%`
        };
      } catch (err) {
        return {
          status: 'unknown',
          message: 'Disk space check not available on this platform'
        };
      }
    }, { critical: false, description: 'Disk space monitoring' });

    // External services health check
    this.register('external', async () => {
      const axios = require('axios');
      const services = [
        { name: 'Google', url: 'https://www.google.com', timeout: 3000 },
        { name: 'Cloudflare', url: 'https://www.cloudflare.com', timeout: 3000 }
      ];

      const results = await Promise.allSettled(
        services.map(async (service) => {
          const startTime = Date.now();
          try {
            await axios.get(service.url, { timeout: service.timeout });
            const responseTime = Date.now() - startTime;
            return {
              name: service.name,
              status: 'healthy',
              responseTime: `${responseTime}ms`
            };
          } catch (err) {
            return {
              name: service.name,
              status: 'unhealthy',
              error: err.message
            };
          }
        })
      );

      const healthy = results.filter(r => r.status === 'fulfilled' && r.value.status === 'healthy').length;
      const total = results.length;

      return {
        status: healthy === total ? 'healthy' : 'degraded',
        services: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'error' }),
        summary: `${healthy}/${total} services healthy`
      };
    }, { critical: false, description: 'External services connectivity' });
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = {};
    let overallStatus = 'healthy';
    let criticalFailures = 0;

    for (const [name, check] of this.checks) {
      try {
        const startTime = Date.now();
        
        // Run check with timeout
        const result = await Promise.race([
          check.check(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Check timeout')), check.timeout)
          )
        ]);

        const duration = Date.now() - startTime;
        
        results[name] = {
          ...result,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        };

        if (result.status !== 'healthy' && check.critical) {
          criticalFailures++;
          overallStatus = 'unhealthy';
        } else if (result.status !== 'healthy' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }

      } catch (err) {
        results[name] = {
          status: 'unhealthy',
          error: err.message,
          timestamp: new Date().toISOString()
        };

        if (check.critical) {
          criticalFailures++;
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      criticalFailures,
      checks: results
    };
  }

  /**
   * Run a specific health check
   */
  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    try {
      const startTime = Date.now();
      const result = await Promise.race([
        check.check(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Check timeout')), check.timeout)
        )
      ]);

      const duration = Date.now() - startTime;
      
      return {
        ...result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        description: check.description
      };
    } catch (err) {
      return {
        status: 'unhealthy',
        error: err.message,
        timestamp: new Date().toISOString(),
        description: check.description
      };
    }
  }
}

/**
 * Health check middleware
 */
const createHealthCheckMiddleware = (healthChecker) => {
  return async (req, res, next) => {
    try {
      const { check } = req.query;
      
      if (check) {
        // Run specific check
        const result = await healthChecker.runCheck(check);
        const statusCode = result.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json(result);
      } else {
        // Run all checks
        const results = await healthChecker.runAllChecks();
        const statusCode = results.status === 'healthy' ? 200 : 
                          results.status === 'degraded' ? 200 : 503;
        
        res.status(statusCode).json(results);
      }
    } catch (err) {
      error('Health check error', { error: err.message, requestId: req.requestId });
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Readiness probe middleware
 */
const createReadinessMiddleware = (healthChecker) => {
  return async (req, res, next) => {
    try {
      const results = await healthChecker.runAllChecks();
      
      // Only return 200 if all critical checks pass
      const criticalChecks = Array.from(healthChecker.checks.entries())
        .filter(([_, check]) => check.critical)
        .map(([name, _]) => name);
      
      const criticalResults = criticalChecks.map(name => results.checks[name]);
      const allCriticalHealthy = criticalResults.every(result => result.status === 'healthy');
      
      if (allCriticalHealthy) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          criticalFailures: results.criticalFailures,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      error('Readiness check error', { error: err.message, requestId: req.requestId });
      res.status(503).json({
        status: 'not ready',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Liveness probe middleware
 */
const createLivenessMiddleware = () => {
  return (req, res) => {
    res.status(200).json({
      status: 'alive',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: process.memoryUsage()
    });
  };
};

/**
 * Metrics middleware
 */
const createMetricsMiddleware = () => {
  const metrics = {
    requests: {
      total: 0,
      successful: 0,
      failed: 0,
      byMethod: {},
      byStatus: {},
      responseTime: {
        min: Infinity,
        max: 0,
        sum: 0,
        count: 0
      }
    },
    errors: {
      total: 0,
      byType: {},
      byEndpoint: {}
    }
  };

  return (req, res, next) => {
    const startTime = Date.now();
    
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Update metrics
      metrics.requests.total++;
      metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1;
      metrics.requests.byStatus[res.statusCode] = (metrics.requests.byStatus[res.statusCode] || 0) + 1;
      
      if (res.statusCode < 400) {
        metrics.requests.successful++;
      } else {
        metrics.requests.failed++;
        metrics.errors.total++;
        metrics.errors.byEndpoint[req.path] = (metrics.errors.byEndpoint[req.path] || 0) + 1;
      }
      
      // Update response time metrics
      metrics.requests.responseTime.min = Math.min(metrics.requests.responseTime.min, duration);
      metrics.requests.responseTime.max = Math.max(metrics.requests.responseTime.max, duration);
      metrics.requests.responseTime.sum += duration;
      metrics.requests.responseTime.count++;
      
      originalSend.call(this, data);
    };

    // Expose metrics endpoint
    if (req.path === '/metrics') {
      const avgResponseTime = metrics.requests.responseTime.count > 0 
        ? metrics.requests.responseTime.sum / metrics.requests.responseTime.count 
        : 0;

      res.json({
        ...metrics,
        requests: {
          ...metrics.requests,
          responseTime: {
            ...metrics.requests.responseTime,
            average: Math.round(avgResponseTime)
          }
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
      return;
    }

    next();
  };
};

module.exports = {
  HealthChecker,
  createHealthCheckMiddleware,
  createReadinessMiddleware,
  createLivenessMiddleware,
  createMetricsMiddleware
};