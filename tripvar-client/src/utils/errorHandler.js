/**
 * Comprehensive error handling utility for React applications
 */
class ErrorHandler {
  constructor() {
    this.errorReportingEnabled = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
    this.debugMode = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';
    this.errorBoundary = null;
    this.errorQueue = [];
    this.maxQueueSize = 50;
  }

  /**
   * Set error boundary reference
   * @param {Object} errorBoundary - Error boundary component instance
   */
  setErrorBoundary(errorBoundary) {
    this.errorBoundary = errorBoundary;
  }

  /**
   * Handle JavaScript errors
   * @param {Error} error - Error object
   * @param {Object} errorInfo - Additional error information
   * @param {string} context - Error context
   */
  handleError(error, errorInfo = {}, context = 'Unknown') {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      ...errorInfo
    };

    // Log error locally
    this.logError(errorData);

    // Add to error queue
    this.addToQueue(errorData);

    // Report to external service if enabled
    if (this.errorReportingEnabled) {
      this.reportError(errorData);
    }

    // Show user-friendly error message
    this.showUserError(error, context);

    // Update error boundary if available
    if (this.errorBoundary) {
      this.errorBoundary.setState({
        hasError: true,
        error: error,
        errorInfo: errorInfo
      });
    }
  }

  /**
   * Handle API errors
   * @param {Object} error - Axios error object
   * @param {Object} config - Request configuration
   */
  handleApiError(error, config = {}) {
    const errorData = {
      type: 'API_ERROR',
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    // Log error locally
    this.logError(errorData);

    // Add to error queue
    this.addToQueue(errorData);

    // Report to external service if enabled
    if (this.errorReportingEnabled) {
      this.reportError(errorData);
    }

    // Handle specific error types
    this.handleSpecificApiError(error, config);
  }

  /**
   * Handle specific API error types
   * @param {Object} error - Axios error object
   * @param {Object} config - Request configuration
   */
  handleSpecificApiError(error, config) {
    const status = error.response?.status;
    const errorData = error.response?.data;

    switch (status) {
      case 400:
        this.showUserError(new Error('Invalid request. Please check your input.'), 'API');
        break;
      case 401:
        this.handleUnauthorizedError();
        break;
      case 403:
        this.showUserError(new Error('You do not have permission to perform this action.'), 'API');
        break;
      case 404:
        this.showUserError(new Error('The requested resource was not found.'), 'API');
        break;
      case 422:
        this.handleValidationError(errorData);
        break;
      case 429:
        this.showUserError(new Error('Too many requests. Please try again later.'), 'API');
        break;
      case 500:
        this.showUserError(new Error('Server error. Please try again later.'), 'API');
        break;
      case 503:
        this.showUserError(new Error('Service temporarily unavailable. Please try again later.'), 'API');
        break;
      default:
        this.showUserError(new Error('An unexpected error occurred. Please try again.'), 'API');
    }
  }

  /**
   * Handle unauthorized errors
   */
  handleUnauthorizedError() {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Handle validation errors
   * @param {Object} errorData - Error data from API
   */
  handleValidationError(errorData) {
    if (errorData?.details && Array.isArray(errorData.details)) {
      const validationMessages = errorData.details.map(detail => detail.message).join(', ');
      this.showUserError(new Error(`Validation failed: ${validationMessages}`), 'API');
    } else {
      this.showUserError(new Error(errorData?.message || 'Validation failed'), 'API');
    }
  }

  /**
   * Log error locally
   * @param {Object} errorData - Error data
   */
  logError(errorData) {
    if (this.debugMode) {
      console.group('🚨 Error Handler');
      console.error('Error:', errorData);
      console.groupEnd();
    }
  }

  /**
   * Add error to queue
   * @param {Object} errorData - Error data
   */
  addToQueue(errorData) {
    this.errorQueue.push(errorData);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Report error to external service
   * @param {Object} errorData - Error data
   */
  async reportError(errorData) {
    try {
      // Report to Sentry if available
      if (window.Sentry) {
        window.Sentry.captureException(new Error(errorData.message), {
          extra: errorData
        });
      }

      // Report to custom error reporting service
      if (import.meta.env.VITE_ERROR_REPORTING_URL) {
        await fetch(import.meta.env.VITE_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData)
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Show user-friendly error message
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  showUserError(error, context) {
    // Import toast dynamically to avoid circular dependencies
    import('react-hot-toast').then(({ toast }) => {
      toast.error(this.getUserFriendlyMessage(error, context), {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }).catch(() => {
      // Fallback to alert if toast is not available
      alert(this.getUserFriendlyMessage(error, context));
    });
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(error, context) {
    const messages = {
      'API': 'Something went wrong while communicating with the server. Please try again.',
      'NETWORK': 'Network error. Please check your internet connection and try again.',
      'VALIDATION': 'Please check your input and try again.',
      'AUTHENTICATION': 'Please log in to continue.',
      'AUTHORIZATION': 'You do not have permission to perform this action.',
      'NOT_FOUND': 'The requested resource was not found.',
      'SERVER': 'Server error. Please try again later.',
      'UNKNOWN': 'An unexpected error occurred. Please try again.'
    };

    // Check if error message is already user-friendly
    if (error.message && !error.message.includes('Error:') && !error.stack) {
      return error.message;
    }

    // Return context-specific message
    return messages[context] || messages['UNKNOWN'];
  }

  /**
   * Get current user ID
   * @returns {string|null} User ID
   */
  getCurrentUserId() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  }

  /**
   * Get session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Get error queue
   * @returns {Array} Error queue
   */
  getErrorQueue() {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrorQueue() {
    this.errorQueue = [];
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {},
      byContext: {},
      recent: this.errorQueue.slice(-10)
    };

    this.errorQueue.forEach(error => {
      // Count by type
      const type = error.type || 'UNKNOWN';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count by context
      const context = error.context || 'UNKNOWN';
      stats.byContext[context] = (stats.byContext[context] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Global error handlers
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, 'GLOBAL');
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(new Error(event.reason), {
    type: 'UNHANDLED_PROMISE_REJECTION'
  }, 'PROMISE');
});

export default errorHandler;
export { ErrorHandler };