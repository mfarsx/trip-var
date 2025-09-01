/**
 * Simple Dependency Injection Container
 */
class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.factories = new Map();
  }

  /**
   * Register a service
   * @param {string} name - Service name
   * @param {Function|Object} service - Service constructor or instance
   * @param {Object} options - Registration options
   */
  register(name, service, options = {}) {
    const { singleton = false, dependencies = [] } = options;
    
    this.services.set(name, {
      service,
      dependencies,
      singleton
    });
  }

  /**
   * Register a factory function
   * @param {string} name - Factory name
   * @param {Function} factory - Factory function
   * @param {Array} dependencies - Factory dependencies
   */
  registerFactory(name, factory, dependencies = []) {
    this.factories.set(name, {
      factory,
      dependencies
    });
  }

  /**
   * Register a singleton instance
   * @param {string} name - Singleton name
   * @param {*} instance - Singleton instance
   */
  registerInstance(name, instance) {
    this.singletons.set(name, instance);
  }

  /**
   * Get a service instance
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  get(name) {
    // Check if it's a singleton instance
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Check if it's a factory
    if (this.factories.has(name)) {
      return this.createFromFactory(name);
    }

    // Check if it's a registered service
    if (this.services.has(name)) {
      return this.createFromService(name);
    }

    throw new Error(`Service '${name}' not found`);
  }

  /**
   * Create instance from service registration
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  createFromService(name) {
    const serviceConfig = this.services.get(name);
    const { service, dependencies, singleton } = serviceConfig;

    // Resolve dependencies
    const resolvedDependencies = dependencies.map(dep => this.get(dep));

    // Create instance
    let instance;
    if (typeof service === 'function') {
      instance = new service(...resolvedDependencies);
    } else {
      instance = service;
    }

    // Store as singleton if configured
    if (singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Create instance from factory
   * @param {string} name - Factory name
   * @returns {*} Factory result
   */
  createFromFactory(name) {
    const factoryConfig = this.factories.get(name);
    const { factory, dependencies } = factoryConfig;

    // Resolve dependencies
    const resolvedDependencies = dependencies.map(dep => this.get(dep));

    // Call factory function
    return factory(...resolvedDependencies);
  }

  /**
   * Check if service is registered
   * @param {string} name - Service name
   * @returns {boolean} Registration status
   */
  has(name) {
    return this.services.has(name) || 
           this.factories.has(name) || 
           this.singletons.has(name);
  }

  /**
   * Remove a service
   * @param {string} name - Service name
   */
  remove(name) {
    this.services.delete(name);
    this.factories.delete(name);
    this.singletons.delete(name);
  }

  /**
   * Clear all services
   */
  clear() {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }

  /**
   * Get all registered service names
   * @returns {Array<string>} Service names
   */
  getServiceNames() {
    return [
      ...this.services.keys(),
      ...this.factories.keys(),
      ...this.singletons.keys()
    ];
  }
}

// Create global container instance
const container = new Container();

module.exports = container;