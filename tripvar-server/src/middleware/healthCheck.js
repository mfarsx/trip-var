const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');
const { health } = require('../utils/logger');
const config = require('../config/config');

/**
 * Health check status
 */
const HealthStatus = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  DEGRADED: 'degraded'
};

/**
 * Component health check result
 */
class ComponentHealth {
  constructor(name, status, message = '', details = {}) {
    this.name = name;
    this.status = status;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Overall health check result
 */
class HealthCheckResult {
  constructor() {
    this.status = HealthStatus.HEALTHY;
    this.timestamp = new Date().toISOString();
    this.uptime = process.uptime();
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = config.server.nodeEnv;
    this.components = [];
  }

  addComponent(component) {
    this.components.push(component);
    
    // Update overall status based on component status
    if (component.status === HealthStatus.UNHEALTHY) {
      this.status = HealthStatus.UNHEALTHY;
    } else if (component.status === HealthStatus.DEGRADED && this.status === HealthStatus.HEALTHY) {
      this.status = HealthStatus.DEGRADED;
    }
  }

  toJSON() {
    return {
      status: this.status,
      timestamp: this.timestamp,
      uptime: this.uptime,
      version: this.version,
      environment: this.environment,
      components: this.components
    };
  }
}

/**
 * Check database health
 */
async function checkDatabase() {
  const startTime = Date.now();
  
  try {
    // Check connection status
    if (mongoose.connection.readyState !== 1) {
      return new ComponentHealth(
        'database',
        HealthStatus.UNHEALTHY,
        'Database connection is not established',
        { readyState: mongoose.connection.readyState }
      );
    }

    // Test database query
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;

    return new ComponentHealth(
      'database',
      HealthStatus.HEALTHY,
      'Database is healthy',
      {
        responseTime: `${responseTime}ms`,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    );
  } catch (error) {
    return new ComponentHealth(
      'database',
      HealthStatus.UNHEALTHY,
      'Database health check failed',
      {
        error: error.message,
        responseTime: `${Date.now() - startTime}ms`
      }
    );
  }
}

/**
 * Check Redis health
 */
async function checkRedis() {
  const startTime = Date.now();
  
  try {
    const client = getRedisClient();
    
    if (!client) {
      return new ComponentHealth(
        'redis',
        HealthStatus.DEGRADED,
        'Redis client not available',
        { responseTime: `${Date.now() - startTime}ms` }
      );
    }

    // Test Redis connection
    const pong = await client.ping();
    const responseTime = Date.now() - startTime;

    if (pong === 'PONG') {
      return new ComponentHealth(
        'redis',
        HealthStatus.HEALTHY,
        'Redis is healthy',
        {
          responseTime: `${responseTime}ms`,
          status: client.status
        }
      );
    } else {
      return new ComponentHealth(
        'redis',
        HealthStatus.UNHEALTHY,
        'Redis ping failed',
        {
          responseTime: `${responseTime}ms`,
          pingResponse: pong
        }
      );
    }
  } catch (error) {
    return new ComponentHealth(
      'redis',
      HealthStatus.DEGRADED,
      'Redis health check failed',
      {
        error: error.message,
        responseTime: `${Date.now() - startTime}ms`
      }
    );
  }
}

/**
 * Check memory usage
 */
function checkMemory() {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const usagePercent = (usedMem / totalMem) * 100;

  let status = HealthStatus.HEALTHY;
  let message = 'Memory usage is normal';

  if (usagePercent > 90) {
    status = HealthStatus.UNHEALTHY;
    message = 'Memory usage is critically high';
  } else if (usagePercent > 80) {
    status = HealthStatus.DEGRADED;
    message = 'Memory usage is high';
  }

  return new ComponentHealth(
    'memory',
    status,
    message,
    {
      heapUsed: `${Math.round(usedMem / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(totalMem / 1024 / 1024)}MB`,
      usagePercent: `${Math.round(usagePercent)}%`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    }
  );
}

/**
 * Check CPU usage
 */
function checkCPU() {
  const cpuUsage = process.cpuUsage();
  const totalUsage = cpuUsage.user + cpuUsage.system;
  
  // This is a simplified CPU check - in production, you might want to use a more sophisticated approach
  return new ComponentHealth(
    'cpu',
    HealthStatus.HEALTHY,
    'CPU usage is normal',
    {
      user: `${Math.round(cpuUsage.user / 1000)}ms`,
      system: `${Math.round(cpuUsage.system / 1000)}ms`,
      total: `${Math.round(totalUsage / 1000)}ms`
    }
  );
}

/**
 * Check disk space
 */
function checkDiskSpace() {
  // This is a placeholder - in production, you might want to use a library like 'diskusage'
  return new ComponentHealth(
    'disk',
    HealthStatus.HEALTHY,
    'Disk space is available',
    {
      note: 'Disk space monitoring not implemented'
    }
  );
}

/**
 * Check external dependencies
 */
async function checkExternalDependencies() {
  const dependencies = [];
  
  // Check if required environment variables are set
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    dependencies.push(new ComponentHealth(
      'environment',
      HealthStatus.UNHEALTHY,
      'Missing required environment variables',
      { missing: missingEnvVars }
    ));
  } else {
    dependencies.push(new ComponentHealth(
      'environment',
      HealthStatus.HEALTHY,
      'All required environment variables are set'
    ));
  }

  return dependencies;
}

/**
 * Perform comprehensive health check
 */
async function performHealthCheck() {
  const result = new HealthCheckResult();
  
  try {
    // Check core components
    result.addComponent(await checkDatabase());
    result.addComponent(await checkRedis());
    result.addComponent(checkMemory());
    result.addComponent(checkCPU());
    result.addComponent(checkDiskSpace());
    
    // Check external dependencies
    const externalDeps = await checkExternalDependencies();
    externalDeps.forEach(dep => result.addComponent(dep));
    
    // Log health check result
    health('Health check completed', {
      status: result.status,
      components: result.components.length,
      unhealthy: result.components.filter(c => c.status === HealthStatus.UNHEALTHY).length,
      degraded: result.components.filter(c => c.status === HealthStatus.DEGRADED).length
    });
    
    return result;
  } catch (error) {
    result.status = HealthStatus.UNHEALTHY;
    result.addComponent(new ComponentHealth(
      'health-check',
      HealthStatus.UNHEALTHY,
      'Health check failed',
      { error: error.message }
    ));
    
    return result;
  }
}

/**
 * Health check middleware
 */
const healthCheckMiddleware = async (req, res, next) => {
  try {
    const healthResult = await performHealthCheck();
    
    // Set appropriate HTTP status code
    const statusCode = healthResult.status === HealthStatus.HEALTHY ? 200 : 
                      healthResult.status === HealthStatus.DEGRADED ? 200 : 503;
    
    res.status(statusCode).json(healthResult.toJSON());
  } catch (error) {
    res.status(503).json({
      status: HealthStatus.UNHEALTHY,
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
};

/**
 * Liveness probe - simple check if the application is running
 */
const livenessProbe = (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

/**
 * Readiness probe - check if the application is ready to serve traffic
 */
const readinessProbe = async (req, res) => {
  try {
    // Quick check of critical components
    const dbHealthy = mongoose.connection.readyState === 1;
    
    if (dbHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        components: {
          database: 'ready'
        }
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        components: {
          database: 'not ready'
        }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

module.exports = {
  healthCheckMiddleware,
  livenessProbe,
  readinessProbe,
  performHealthCheck,
  HealthStatus,
  ComponentHealth,
  HealthCheckResult
};