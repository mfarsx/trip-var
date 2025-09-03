/**
 * Comprehensive form validation utility
 */
class FormValidator {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.setupDefaultRules();
  }

  /**
   * Setup default validation rules
   */
  setupDefaultRules() {
    // Email validation
    this.addRule('email', {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    });

    // Password validation
    this.addRule('password', {
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    });

    // Phone number validation
    this.addRule('phone', {
      pattern: /^[+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    });

    // URL validation
    this.addRule('url', {
      pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
      message: 'Please enter a valid URL'
    });

    // Name validation
    this.addRule('name', {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name must be 2-50 characters and contain only letters and spaces'
    });

    // Required field validation
    this.addRule('required', {
      required: true,
      message: 'This field is required'
    });

    // Number validation
    this.addRule('number', {
      pattern: /^\d+$/,
      message: 'Please enter a valid number'
    });

    // Decimal validation
    this.addRule('decimal', {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: 'Please enter a valid decimal number'
    });

    // Date validation
    this.addRule('date', {
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'Please enter a valid date (YYYY-MM-DD)'
    });

    // Credit card validation
    this.addRule('creditCard', {
      pattern: /^[0-9]{13,19}$/,
      message: 'Please enter a valid credit card number'
    });

    // CVV validation
    this.addRule('cvv', {
      pattern: /^[0-9]{3,4}$/,
      message: 'Please enter a valid CVV'
    });
  }

  /**
   * Add custom validation rule
   * @param {string} name - Rule name
   * @param {Object} rule - Rule configuration
   */
  addRule(name, rule) {
    this.rules.set(name, rule);
  }

  /**
   * Add custom validator function
   * @param {string} name - Validator name
   * @param {Function} validator - Validator function
   */
  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator);
  }

  /**
   * Validate field value
   * @param {*} value - Field value
   * @param {string|Array} rules - Validation rules
   * @param {Object} context - Additional context
   * @returns {Object} Validation result
   */
  validateField(value, rules, context = {}) {
    const ruleList = Array.isArray(rules) ? rules : [rules];
    const errors = [];

    for (const ruleName of ruleList) {
      const error = this.validateSingleRule(value, ruleName, context);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      firstError: errors[0] || null
    };
  }

  /**
   * Validate single rule
   * @param {*} value - Field value
   * @param {string} ruleName - Rule name
   * @param {Object} context - Additional context
   * @returns {string|null} Error message or null
   */
  validateSingleRule(value, ruleName, context = {}) {
    const rule = this.rules.get(ruleName);
    if (!rule) {
      return `Unknown validation rule: ${ruleName}`;
    }

    // Handle required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      return rule.message || 'This field is required';
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // Convert value to string for pattern matching
    const stringValue = String(value);

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength} characters`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength} characters`;
    }

    // Numeric validations
    if (rule.min !== undefined && Number(value) < rule.min) {
      return rule.message || `Minimum value is ${rule.min}`;
    }

    if (rule.max !== undefined && Number(value) > rule.max) {
      return rule.message || `Maximum value is ${rule.max}`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || 'Invalid format';
    }

    // Custom validator
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value, context);
      if (result !== true) {
        return result || rule.message || 'Invalid value';
      }
    }

    // Custom validator by name
    if (rule.customValidator) {
      const validator = this.customValidators.get(rule.customValidator);
      if (validator) {
        const result = validator(value, context);
        if (result !== true) {
          return result || rule.message || 'Invalid value';
        }
      }
    }

    return null;
  }

  /**
   * Validate form data
   * @param {Object} data - Form data
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation result
   */
  validateForm(data, schema) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, rules] of Object.entries(schema)) {
      const fieldValue = data[fieldName];
      const result = this.validateField(fieldValue, rules, { fieldName, data });

      if (!result.isValid) {
        errors[fieldName] = result.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors,
      hasErrors: Object.keys(errors).length > 0
    };
  }

  /**
   * Sanitize input value
   * @param {*} value - Input value
   * @param {string} type - Input type
   * @returns {*} Sanitized value
   */
  sanitizeInput(value, type = 'string') {
    if (value === null || value === undefined) {
      return value;
    }

    switch (type) {
      case 'string':
        return String(value).trim();
      case 'number':
        return Number(value);
      case 'email':
        return String(value).trim().toLowerCase();
      case 'phone':
        return String(value).replace(/[^\d+]/g, '');
      case 'url':
        return String(value).trim();
      case 'date':
        return String(value).trim();
      default:
        return value;
    }
  }

  /**
   * Get validation rules for common field types
   * @param {string} type - Field type
   * @param {Object} options - Additional options
   * @returns {Array} Validation rules
   */
  getRulesForType(type, options = {}) {
    const rules = ['required'];

    switch (type) {
      case 'email':
        rules.push('email');
        break;
      case 'password':
        rules.push('password');
        break;
      case 'phone':
        rules.push('phone');
        break;
      case 'url':
        rules.push('url');
        break;
      case 'name':
        rules.push('name');
        break;
      case 'number':
        rules.push('number');
        if (options.min !== undefined) {
          rules.push({ min: options.min, message: `Minimum value is ${options.min}` });
        }
        if (options.max !== undefined) {
          rules.push({ max: options.max, message: `Maximum value is ${options.max}` });
        }
        break;
      case 'decimal':
        rules.push('decimal');
        break;
      case 'date':
        rules.push('date');
        break;
      case 'creditCard':
        rules.push('creditCard');
        break;
      case 'cvv':
        rules.push('cvv');
        break;
    }

    return rules;
  }
}

// Create singleton instance
const formValidator = new FormValidator();

// Add common custom validators
formValidator.addCustomValidator('confirmPassword', (value, context) => {
  const { data } = context;
  if (data.password && value !== data.password) {
    return 'Passwords do not match';
  }
  return true;
});

formValidator.addCustomValidator('futureDate', (value) => {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date <= today) {
    return 'Date must be in the future';
  }
  return true;
});

formValidator.addCustomValidator('pastDate', (value) => {
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (date >= today) {
    return 'Date must be in the past';
  }
  return true;
});

formValidator.addCustomValidator('age', (value) => {
  const birthDate = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age;
    
  if (actualAge < 18) {
    return 'You must be at least 18 years old';
  }
  return true;
});

export default formValidator;
export { FormValidator };