// Removed logger dependency to avoid circular dependency

/**
 * Environment variable validation utility
 */
class EnvironmentValidator {
  constructor() {
    this.validations = new Map();
    this.errors = [];
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
      description = ''
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
      description
    });
  }

  /**
   * Validate all environment variables
   * @returns {boolean} Validation result
   */
  validate() {
    this.errors = [];

    for (const [key, rules] of this.validations) {
      const value = process.env[key];
      
      // Check if required
      if (rules.required && (value === undefined || value === null || value === '')) {
        this.errors.push(`Required environment variable '${key}' is missing`);
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
        this.errors.push(`Environment variable '${key}' must be at least ${rules.minLength} characters long`);
      }

      if (rules.maxLength !== null && value.length > rules.maxLength) {
        this.errors.push(`Environment variable '${key}' must be no more than ${rules.maxLength} characters long`);
      }

      // Numeric validation
      if (rules.type === 'number') {
        const numValue = Number(value);
        if (rules.min !== null && numValue < rules.min) {
          this.errors.push(`Environment variable '${key}' must be at least ${rules.min}`);
        }
        if (rules.max !== null && numValue > rules.max) {
          this.errors.push(`Environment variable '${key}' must be no more than ${rules.max}`);
        }
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        this.errors.push(`Environment variable '${key}' does not match required pattern`);
      }

      // Allowed values validation
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        this.errors.push(`Environment variable '${key}' must be one of: ${rules.allowedValues.join(', ')}`);
      }

      // Custom validation
      if (rules.customValidator && !rules.customValidator(value)) {
        this.errors.push(`Environment variable '${key}' failed custom validation`);
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
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          this.errors.push(`Environment variable '${key}' must be a valid email address`);
          return false;
        }
        return true;
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
   * Get validation summary
   * @returns {Object} Validation summary
   */
  getSummary() {
    return {
      total: this.validations.size,
      passed: this.validations.size - this.errors.length,
      failed: this.errors.length,
      errors: this.errors
    };
  }

  /**
   * Generate environment documentation
   * @returns {string} Markdown documentation
   */
  generateDocumentation() {
    let doc = '# Environment Variables\n\n';
    doc += 'This document describes all environment variables used by the Tripvar server.\n\n';

    for (const [key, rules] of this.validations) {
      doc += `## ${key}\n\n`;
      doc += `**Description:** ${rules.description || 'No description provided'}\n\n`;
      doc += `**Required:** ${rules.required ? 'Yes' : 'No'}\n\n`;
      doc += `**Type:** ${rules.type}\n\n`;
      
      if (rules.allowedValues) {
        doc += `**Allowed Values:** ${rules.allowedValues.join(', ')}\n\n`;
      }
      
      if (rules.minLength !== null || rules.maxLength !== null) {
        doc += `**Length:** `;
        if (rules.minLength !== null && rules.maxLength !== null) {
          doc += `${rules.minLength}-${rules.maxLength} characters\n\n`;
        } else if (rules.minLength !== null) {
          doc += `minimum ${rules.minLength} characters\n\n`;
        } else {
          doc += `maximum ${rules.maxLength} characters\n\n`;
        }
      }
      
      if (rules.pattern) {
        doc += `**Pattern:** \`${rules.pattern.source}\`\n\n`;
      }
      
      doc += '---\n\n';
    }

    return doc;
  }
}

// Create validator instance with all required validations
const envValidator = new EnvironmentValidator();

// Server configuration
envValidator.addValidation('NODE_ENV', {
  required: true,
  type: 'string',
  allowedValues: ['development', 'production', 'test'],
  description: 'Application environment'
});

envValidator.addValidation('PORT', {
  required: true,
  type: 'number',
  min: 1,
  max: 65535,
  description: 'Server port number'
});

envValidator.addValidation('HOST', {
  required: false,
  type: 'string',
  description: 'Server host address'
});

// Database configuration
envValidator.addValidation('MONGODB_URI', {
  required: true,
  type: 'url',
  pattern: /^mongodb(\+srv)?:\/\//,
  description: 'MongoDB connection URI'
});

envValidator.addValidation('DB_MAX_POOL_SIZE', {
  required: false,
  type: 'number',
  min: 1,
  max: 100,
  description: 'Maximum database connection pool size'
});

// Redis configuration
envValidator.addValidation('REDIS_URL', {
  required: false,
  type: 'url',
  pattern: /^redis:\/\//,
  description: 'Redis connection URL'
});

// JWT configuration
envValidator.addValidation('JWT_SECRET', {
  required: true,
  type: 'string',
  minLength: 32,
  description: 'JWT secret key for token signing'
});

envValidator.addValidation('JWT_EXPIRES_IN', {
  required: false,
  type: 'string',
  pattern: /^\d+[smhd]$/,
  description: 'JWT token expiration time'
});

// Security configuration
envValidator.addValidation('ALLOWED_ORIGINS', {
  required: false,
  type: 'string',
  description: 'Comma-separated list of allowed CORS origins'
});

envValidator.addValidation('CORS_CREDENTIALS', {
  required: false,
  type: 'boolean',
  description: 'Enable CORS credentials'
});

envValidator.addValidation('BCRYPT_ROUNDS', {
  required: false,
  type: 'number',
  min: 10,
  max: 15,
  description: 'Number of bcrypt rounds for password hashing'
});

// Logging configuration
envValidator.addValidation('LOG_LEVEL', {
  required: false,
  type: 'string',
  allowedValues: ['error', 'warn', 'info', 'debug'],
  description: 'Logging level'
});

// SSL configuration
envValidator.addValidation('SSL_ENABLED', {
  required: false,
  type: 'boolean',
  description: 'Enable SSL/TLS'
});

// Email configuration
envValidator.addValidation('SMTP_HOST', {
  required: false,
  type: 'string',
  description: 'SMTP server hostname'
});

envValidator.addValidation('SMTP_PORT', {
  required: false,
  type: 'number',
  min: 1,
  max: 65535,
  description: 'SMTP server port'
});

envValidator.addValidation('FROM_EMAIL', {
  required: false,
  type: 'email',
  description: 'Default sender email address'
});

// External APIs
envValidator.addValidation('GOOGLE_MAPS_API_KEY', {
  required: false,
  type: 'string',
  description: 'Google Maps API key'
});

envValidator.addValidation('STRIPE_SECRET_KEY', {
  required: false,
  type: 'string',
  pattern: /^sk_(test_|live_)/,
  description: 'Stripe secret key'
});

// File upload configuration
envValidator.addValidation('MAX_FILE_SIZE', {
  required: false,
  type: 'number',
  min: 1024,
  max: 104857600, // 100MB
  description: 'Maximum file upload size in bytes'
});

// Monitoring
envValidator.addValidation('SENTRY_DSN', {
  required: false,
  type: 'url',
  description: 'Sentry DSN for error tracking'
});

/**
 * Validate environment variables and exit if validation fails
 */
function validateEnvironment() {
  const isValid = envValidator.validate();
  
  if (!isValid) {
    const summary = envValidator.getSummary();
    
    // Use console.error instead of logger to avoid circular dependency
    console.error('Environment validation failed', {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      errors: summary.errors
    });
    
    console.error('\n❌ Environment validation failed:');
    summary.errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease check your environment variables and try again.\n');
    
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}

module.exports = {
  EnvironmentValidator,
  envValidator,
  validateEnvironment
};