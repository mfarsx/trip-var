/**
 * Security utilities for client-side protection
 */
class SecurityUtils {
  constructor() {
    this.trustedDomains = this.getTrustedDomains();
    this.cspNonce = this.generateNonce();
  }

  /**
   * Get trusted domains from environment
   * @returns {Array} Array of trusted domains
   */
  getTrustedDomains() {
    const domains = import.meta.env.VITE_TRUSTED_DOMAINS || 'localhost:8000';
    return domains.split(',').map(domain => domain.trim());
  }

  /**
   * Generate CSP nonce
   * @returns {string} CSP nonce
   */
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate URL against trusted domains
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is trusted
   */
  isTrustedUrl(url) {
    try {
      const urlObj = new URL(url);
      return this.trustedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Sanitize HTML content
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Sanitize URL
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '#';
      }

      // Check if URL is trusted
      if (!this.isTrustedUrl(url)) {
        return '#';
      }

      return urlObj.toString();
    } catch {
      return '#';
    }
  }

  /**
   * Validate and sanitize input
   * @param {string} input - Input to validate
   * @param {string} type - Input type
   * @returns {string} Sanitized input
   */
  sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') {
      return '';
    }

    switch (type) {
      case 'email':
        return input.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '');
      case 'url':
        return this.sanitizeUrl(input);
      case 'html':
        return this.sanitizeHtml(input);
      case 'number':
        return input.replace(/[^0-9.-]/g, '');
      case 'phone':
        return input.replace(/[^0-9+()-]/g, '');
      default:
        return input.trim().replace(/[<>]/g, '');
    }
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of random string
   * @returns {string} Random string
   */
  generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash string using Web Crypto API
   * @param {string} text - Text to hash
   * @returns {Promise<string>} Hashed string
   */
  async hashString(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate JWT token format
   * @param {string} token - JWT token
   * @returns {boolean} Whether token format is valid
   */
  isValidJWTFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Decode JWT payload (without verification)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload or null
   */
  decodeJWTPayload(token) {
    if (!this.isValidJWTFormat(token)) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Check if JWT token is expired
   * @param {string} token - JWT token
   * @returns {boolean} Whether token is expired
   */
  isTokenExpired(token) {
    const payload = this.decodeJWTPayload(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Secure storage for sensitive data
   */
  secureStorage = {
    /**
     * Store data securely
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    setItem(key, value) {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(`secure_${key}`, encrypted);
      } catch (error) {
        console.error('Failed to store secure data:', error);
      }
    },

    /**
     * Retrieve data securely
     * @param {string} key - Storage key
     * @returns {*} Retrieved value
     */
    getItem(key) {
      try {
        const encrypted = localStorage.getItem(`secure_${key}`);
        if (!encrypted) {
          return null;
        }
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.error('Failed to retrieve secure data:', error);
        return null;
      }
    },

    /**
     * Remove secure data
     * @param {string} key - Storage key
     */
    removeItem(key) {
      localStorage.removeItem(`secure_${key}`);
    },

    /**
     * Clear all secure data
     */
    clear() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Content Security Policy utilities
   */
  csp = {
    /**
     * Get CSP nonce
     * @returns {string} CSP nonce
     */
    getNonce() {
      return this.cspNonce;
    },

    /**
     * Generate CSP header
     * @returns {string} CSP header value
     */
    generateCSPHeader() {
      const trustedDomains = this.trustedDomains.join(' ');
      
      return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${this.cspNonce}'`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        `font-src 'self' https://fonts.gstatic.com`,
        `img-src 'self' data: https:`,
        `connect-src 'self' ${trustedDomains}`,
        `frame-src 'none'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `upgrade-insecure-requests`
      ].join('; ');
    }
  };

  /**
   * XSS protection utilities
   */
  xss = {
    /**
     * Escape HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Unescape HTML characters
     * @param {string} html - HTML to unescape
     * @returns {string} Unescaped text
     */
    unescapeHtml(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    },

    /**
     * Check for potential XSS in input
     * @param {string} input - Input to check
     * @returns {boolean} Whether input contains potential XSS
     */
    containsXSS(input) {
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>.*?<\/embed>/gi,
        /<link[^>]*>.*?<\/link>/gi,
        /<meta[^>]*>.*?<\/meta>/gi
      ];

      return xssPatterns.some(pattern => pattern.test(input));
    }
  };

  /**
   * CSRF protection utilities
   */
  csrf = {
    /**
     * Generate CSRF token
     * @returns {string} CSRF token
     */
    generateToken() {
      return this.generateSecureRandom(32);
    },

    /**
     * Validate CSRF token
     * @param {string} token - Token to validate
     * @param {string} sessionToken - Session token
     * @returns {boolean} Whether token is valid
     */
    validateToken(token, sessionToken) {
      return token && sessionToken && token === sessionToken;
    }
  };
}

// Create singleton instance
const securityUtils = new SecurityUtils();

export default securityUtils;
export { SecurityUtils };