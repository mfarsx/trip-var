/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Async handler for service methods
 * @param {Function} serviceMethod - Service method to wrap
 * @returns {Function} Wrapped service method
 */
const asyncServiceHandler = (serviceMethod) => {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      // Log service errors
      const { error: logError } = require('./logger');
      logError('Service error', {
        error: error.message,
        stack: error.stack,
        method: serviceMethod.name,
        args: args.length
      });
      throw error;
    }
  };
};

/**
 * Retry wrapper for operations that might fail
 * @param {Function} operation - Operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<*>} Operation result
 */
const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors or authentication errors
      if (error.statusCode && error.statusCode < 500) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Timeout wrapper for operations
 * @param {Function} operation - Operation to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<*>} Operation result
 */
const withTimeout = (operation, timeoutMs = 5000) => {
  return Promise.race([
    operation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ]);
};

/**
 * Batch operation handler
 * @param {Array<Function>} operations - Array of operations to execute
 * @param {number} concurrency - Maximum concurrent operations
 * @returns {Promise<Array>} Results of all operations
 */
const batchOperations = async (operations, concurrency = 5) => {
  const results = [];
  
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(operation => operation())
    );
    
    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    ));
  }
  
  return results;
};

module.exports = {
  asyncHandler,
  asyncServiceHandler,
  withRetry,
  withTimeout,
  batchOperations
};