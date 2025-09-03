/**
 * Environment variable validation utility for Vite
 */
class EnvironmentValidator {
  constructor() {
    this.validations = new Map();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Add validation rule for an environment variable
   * @param {string} key - Environment variable key
   * @param {Object} options - Validation options
   */
  addValidation(key, options = {}) {
    const {
      required = false,
      type = 'string',
      minLength = null,
      maxLength = null,
      min = null,
      max = null,
      pattern = null,
      allowedValues = null,
      customValidator = null,
      description = '',
      defaultValue = null,
      warning = false
    } = options;

    this.validations.set(key, {
      required,
      type,
      minLength,
      maxLength,
      min,
      max,
      pattern,
      allowedValues,
      customValidator,
      description,
      defaultValue,
      warning
    });
  }

  /**
   * Validate all environment variables
   * @returns {boolean} Validation result
   */
  validate() {
    this.errors = [];
    this.warnings = [];

    for (const [key, rules] of this.validations) {
      const value = import.meta.env[key];
      
      // Check if required
      if (rules.required && (value === undefined || value === null || value === '')) {
        const message = `Required environment variable '${key}' is missing`;
        if (rules.warning) {
          this.warnings.push(message);
        } else {
          this.errors.push(message);
        }
        continue;
      }

      // Skip validation if value is not provided and not required
      if (!value && !rules.required) {
        continue;
      }

      // Type validation
      if (!this.validateType(value, rules.type, key)) {
        continue;
      }

      // Length validation
      if (rules.minLength !== null && value.length < rules.minLength) {
        const message = `Environment variable '${key}' must be at least ${rules.minLength} characters long`;
        if (rules.warning) {
          this.warnings.push(message);
        } else {
          this.errors.push(message);
        }
      }

      if (rules.maxLength !== null && value.length > rules.maxLength) {
        const message = `Environment variable '${key}' must be no more than ${rules.maxLength} characters long`;
        if (rules.warning) {
          this.warnings.push(message);
        } else {
          this.errors.push(message);
        }
      }

      // Numeric validation
      if (rules.type === 'number') {
        const numValue = Number(value);
        if (rules.min !== null && numValue < rules.min) {
          const message = `Environment variable '${key}' must be at least ${rules.min}`;
          if (rules.warning) {
            this.warnings.push(message);
          } else {
            this.errors.push(message);
          }
        }
        if (rules.max !== null && numValue > rules.max) {
          const message = `Environment variable '${key}' must be no more than ${rules.max}`;
          if (rules.warning) {
            this.warnings.push(message);
          } else {
            this.errors.push(message);
          }
        }
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        const message = `Environment variable '${key}' does not match required pattern`;
        if (rules.warning) {
          this.warnings.push(message);
        } else {
          this.errors.push(message);
        }
      }

      // Allowed values validation
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        const message = `Environment variable '${key}' must be one of: ${rules.allowedValues.join(', ')}`;
        if (rules.warning) {
          this.warnings.push(message);
        } else {
          this.errors.push(message);
        }
      }

      // Custom validation
      if (rules.customValidator && !rules.customValidator(value)) {
        const message = `Environment variable '${key}' failed custom validation`;
        if (rules.warning) {
          this.warnings.push(message);
        } else {
          this.errors.push(message);
        }
      }
    }

    return this.errors.length === 0;
  }

  /**
   * Validate data type
   * @param {*} value - Value to validate
   * @param {string} type - Expected type
   * @param {string} key - Environment variable key
   * @returns {boolean} Type validation result
   */
  validateType(value, type, key) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        if (isNaN(Number(value))) {
          this.errors.push(`Environment variable '${key}' must be a valid number`);
          return false;
        }
        return true;
      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          this.errors.push(`Environment variable '${key}' must be a boolean (true/false)`);
          return false;
        }
        return true;
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          this.errors.push(`Environment variable '${key}' must be a valid URL`);
          return false;
        }
      case 'email': {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          this.errors.push(`Environment variable '${key}' must be a valid email address`);
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  }

  /**
   * Get validation errors
   * @returns {Array} Array of error messages
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get validation warnings
   * @returns {Array} Array of warning messages
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Get validation summary
   * @returns {Object} Validation summary
   */
  getSummary() {
    return {
      total: this.validations.size,
      passed: this.validations.size - this.errors.length - this.warnings.length,
      errors: this.errors.length,
      warnings: this.warnings.length,
      errorMessages: this.errors,
      warningMessages: this.warnings
    };
  }

  /**
   * Get environment configuration object
   * @returns {Object} Environment configuration
   */
  getConfig() {
    const config = {};
    
    for (const [key, rules] of this.validations) {
      const value = import.meta.env[key];
      
      if (value !== undefined) {
        // Convert value to appropriate type
        let processedValue = value;
        
        if (rules.type === 'number') {
          processedValue = Number(value);
        } else if (rules.type === 'boolean') {
          processedValue = value.toLowerCase() === 'true' || value === '1';
        }
        
        config[key] = processedValue;
      } else if (rules.defaultValue !== null) {
        config[key] = rules.defaultValue;
      }
    }
    
    return config;
  }
}

// Create validator instance with all required validations
const envValidator = new EnvironmentValidator();

// API configuration
envValidator.addValidation('VITE_API_URL', {
  required: true,
  type: 'url',
  description: 'Base URL for the API server'
});

envValidator.addValidation('VITE_API_TIMEOUT', {
  required: false,
  type: 'number',
  min: 1000,
  max: 60000,
  defaultValue: 10000,
  description: 'API request timeout in milliseconds'
});

envValidator.addValidation('VITE_API_RETRY_ATTEMPTS', {
  required: false,
  type: 'number',
  min: 0,
  max: 5,
  defaultValue: 3,
  description: 'Number of API retry attempts'
});

// Application configuration
envValidator.addValidation('VITE_APP_NAME', {
  required: false,
  type: 'string',
  defaultValue: 'Tripvar',
  description: 'Application name'
});

envValidator.addValidation('VITE_APP_VERSION', {
  required: false,
  type: 'string',
  defaultValue: '1.0.0',
  description: 'Application version'
});

// Feature flags
envValidator.addValidation('VITE_ENABLE_ANALYTICS', {
  required: false,
  type: 'boolean',
  defaultValue: false,
  description: 'Enable analytics tracking'
});

envValidator.addValidation('VITE_ENABLE_DEBUG_LOGGING', {
  required: false,
  type: 'boolean',
  defaultValue: import.meta.env.MODE === 'development',
  description: 'Enable debug logging'
});

envValidator.addValidation('VITE_ENABLE_PERFORMANCE_MONITORING', {
  required: false,
  type: 'boolean',
  defaultValue: false,
  description: 'Enable performance monitoring'
});

envValidator.addValidation('VITE_ENABLE_ERROR_REPORTING', {
  required: false,
  type: 'boolean',
  defaultValue: false,
  description: 'Enable error reporting'
});

// External services
envValidator.addValidation('VITE_GOOGLE_MAPS_API_KEY', {
  required: false,
  type: 'string',
  description: 'Google Maps API key',
  warning: true
});

envValidator.addValidation('VITE_STRIPE_PUBLISHABLE_KEY', {
  required: false,
  type: 'string',
  pattern: /^pk_(test_|live_)/,
  description: 'Stripe publishable key',
  warning: true
});

envValidator.addValidation('VITE_WS_URL', {
  required: false,
  type: 'string',
  description: 'WebSocket server URL',
  defaultValue: 'ws://localhost:8000'
});

envValidator.addValidation('VITE_SENTRY_DSN', {
  required: false,
  type: 'url',
  description: 'Sentry DSN for error tracking',
  warning: true
});

// Development configuration
envValidator.addValidation('VITE_DEV_TOOLS_ENABLED', {
  required: false,
  type: 'boolean',
  defaultValue: import.meta.env.MODE === 'development',
  description: 'Enable development tools'
});

envValidator.addValidation('VITE_MOCK_API', {
  required: false,
  type: 'boolean',
  defaultValue: false,
  description: 'Use mock API for development'
});

envValidator.addValidation('VITE_LOG_LEVEL', {
  required: false,
  type: 'string',
  allowedValues: ['debug', 'info', 'warn', 'error'],
  defaultValue: import.meta.env.MODE === 'development' ? 'debug' : 'error',
  description: 'Logging level'
});

// Security configuration
envValidator.addValidation('VITE_TRUSTED_DOMAINS', {
  required: false,
  type: 'string',
  defaultValue: 'localhost:8000',
  description: 'Comma-separated list of trusted domains'
});

// Performance configuration
envValidator.addValidation('VITE_LAZY_LOAD_THRESHOLD', {
  required: false,
  type: 'number',
  min: 0,
  max: 1,
  defaultValue: 0.1,
  description: 'Lazy loading threshold for intersection observer'
});

envValidator.addValidation('VITE_IMAGE_OPTIMIZATION', {
  required: false,
  type: 'boolean',
  defaultValue: true,
  description: 'Enable image optimization'
});

envValidator.addValidation('VITE_PREFETCH_ROUTES', {
  required: false,
  type: 'boolean',
  defaultValue: true,
  description: 'Enable route prefetching'
});

// Analytics configuration
envValidator.addValidation('VITE_GOOGLE_ANALYTICS_ID', {
  required: false,
  type: 'string',
  pattern: /^G-[A-Z0-9]+$/,
  description: 'Google Analytics tracking ID',
  warning: true
});

// Contact information
envValidator.addValidation('VITE_SUPPORT_EMAIL', {
  required: false,
  type: 'email',
  defaultValue: 'support@tripvar.com',
  description: 'Support email address'
});

/**
 * Validate environment variables and log results
 */
function validateEnvironment() {
  const isValid = envValidator.validate();
  const summary = envValidator.getSummary();
  
  if (summary.errors > 0) {
    console.error('❌ Environment validation failed:');
    summary.errorMessages.forEach(err => console.error(`  - ${err}`));
  }
  
  if (summary.warnings > 0) {
    console.warn('⚠️ Environment validation warnings:');
    summary.warningMessages.forEach(warn => console.warn(`  - ${warn}`));
  }
  
  if (isValid && summary.warnings === 0) {
    console.log('✅ Environment validation passed');
  }
  
  return isValid;
}

/**
 * Get validated environment configuration
 */
function getEnvironmentConfig() {
  return envValidator.getConfig();
}

export {
  EnvironmentValidator,
  envValidator,
  validateEnvironment,
  getEnvironmentConfig
};