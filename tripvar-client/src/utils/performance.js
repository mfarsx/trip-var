/**
 * Performance monitoring and optimization utilities
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    this.threshold = parseFloat(import.meta.env.VITE_LAZY_LOAD_THRESHOLD) || 0.1;
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (!this.isEnabled) return;

    // Monitor Core Web Vitals
    this.observeCoreWebVitals();
    
    // Monitor resource loading
    this.observeResourceLoading();
    
    // Monitor user interactions
    this.observeUserInteractions();
    
    // Monitor memory usage
    this.observeMemoryUsage();
  }

  /**
   * Observe Core Web Vitals
   */
  observeCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Observe resource loading
   */
  observeResourceLoading() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 1000) { // Log slow resources
            this.recordMetric('slow-resource', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Observe user interactions
   */
  observeUserInteractions() {
    let interactionCount = 0;
    const startTime = performance.now();

    const trackInteraction = () => {
      interactionCount++;
      this.recordMetric('user-interaction', {
        count: interactionCount,
        time: performance.now() - startTime
      });
    };

    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });
  }

  /**
   * Observe memory usage
   */
  observeMemoryUsage() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        this.recordMetric('memory-usage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      };

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
    }
  }

  /**
   * Record performance metric
   * @param {string} name - Metric name
   * @param {*} value - Metric value
   */
  recordMetric(name, value) {
    if (!this.isEnabled) return;

    const timestamp = Date.now();
    const metric = {
      name,
      value,
      timestamp,
      url: window.location.href
    };

    this.metrics.set(`${name}_${timestamp}`, metric);

    // Keep only last 100 metrics per type
    const metricsOfType = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith(name))
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 100);

    this.metrics.clear();
    metricsOfType.forEach(([key, value]) => this.metrics.set(key, value));

    // Log significant metrics
    if (this.isSignificantMetric(name, value)) {
      console.log(`📊 Performance Metric: ${name}`, value);
    }
  }

  /**
   * Check if metric is significant
   * @param {string} name - Metric name
   * @param {*} value - Metric value
   * @returns {boolean} Whether metric is significant
   */
  isSignificantMetric(name, value) {
    const thresholds = {
      'LCP': 2500, // 2.5 seconds
      'FID': 100,  // 100ms
      'CLS': 0.1,  // 0.1
      'slow-resource': 1000 // 1 second
    };

    return thresholds[name] && value > thresholds[name];
  }

  /**
   * Get performance metrics
   * @param {string} name - Metric name (optional)
   * @returns {Object|Array} Metrics data
   */
  getMetrics(name = null) {
    if (name) {
      return Array.from(this.metrics.values())
        .filter(metric => metric.name === name);
    }
    return Array.from(this.metrics.values());
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    const metrics = this.getMetrics();
    const summary = {};

    metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          values: [],
          average: 0,
          min: Infinity,
          max: -Infinity
        };
      }

      const stat = summary[metric.name];
      stat.count++;
      stat.values.push(metric.value);
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
    });

    // Calculate averages
    Object.keys(summary).forEach(name => {
      const stat = summary[name];
      stat.average = stat.values.reduce((sum, val) => sum + val, 0) / stat.count;
    });

    return summary;
  }
}

/**
 * Lazy loading utilities
 */
class LazyLoader {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '50px';
    this.observer = null;
    this.elements = new Map();
    this.init();
  }

  /**
   * Initialize intersection observer
   */
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          threshold: this.threshold,
          rootMargin: this.rootMargin
        }
      );
    }
  }

  /**
   * Handle intersection changes
   * @param {Array} entries - Intersection entries
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const callback = this.elements.get(element);
        
        if (callback) {
          callback(element);
          this.unobserve(element);
        }
      }
    });
  }

  /**
   * Observe element for lazy loading
   * @param {Element} element - Element to observe
   * @param {Function} callback - Callback when element becomes visible
   */
  observe(element, callback) {
    if (this.observer) {
      this.elements.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      callback(element);
    }
  }

  /**
   * Stop observing element
   * @param {Element} element - Element to stop observing
   */
  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  /**
   * Disconnect observer
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

/**
 * Image optimization utilities
 */
class ImageOptimizer {
  constructor() {
    this.isEnabled = import.meta.env.VITE_IMAGE_OPTIMIZATION === 'true';
    this.lazyLoader = new LazyLoader();
  }

  /**
   * Lazy load image
   * @param {HTMLImageElement} img - Image element
   * @param {string} src - Image source
   * @param {string} placeholder - Placeholder image
   */
  lazyLoadImage(img, src, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=') {
    if (!this.isEnabled) {
      img.src = src;
      return;
    }

    // Set placeholder
    img.src = placeholder;
    img.classList.add('lazy-loading');

    // Lazy load when visible
    this.lazyLoader.observe(img, (element) => {
      const newImg = new Image();
      newImg.onload = () => {
        element.src = src;
        element.classList.remove('lazy-loading');
        element.classList.add('lazy-loaded');
      };
      newImg.onerror = () => {
        element.classList.remove('lazy-loading');
        element.classList.add('lazy-error');
      };
      newImg.src = src;
    });
  }

  /**
   * Optimize image URL
   * @param {string} url - Original image URL
   * @param {Object} options - Optimization options
   * @returns {string} Optimized image URL
   */
  optimizeImageUrl(url, options = {}) {
    if (!this.isEnabled) return url;

    const {
      width,
      height,
      quality = 80,
      format = 'webp'
    } = options;

    // If using a CDN service, add optimization parameters
    if (url.includes('cloudinary.com')) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`, `f_${format}`);
      
      return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }

    return url;
  }
}

/**
 * Bundle analyzer
 */
class BundleAnalyzer {
  constructor() {
    this.chunks = new Map();
    this.analyze();
  }

  /**
   * Analyze bundle chunks
   */
  analyze() {
    if (import.meta.env.MODE === 'development') {
      // In development, we can analyze the module graph
      this.analyzeDevelopment();
    } else {
      // In production, analyze loaded resources
      this.analyzeProduction();
    }
  }

  /**
   * Analyze development bundle
   */
  analyzeDevelopment() {
    console.log('📦 Bundle Analysis (Development Mode)');
    console.log('Available modules:', Object.keys(import.meta.glob('**/*.{js,jsx,ts,tsx}')));
  }

  /**
   * Analyze production bundle
   */
  analyzeProduction() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            this.chunks.set(entry.name, {
              size: entry.transferSize,
              duration: entry.duration,
              type: entry.name.endsWith('.js') ? 'javascript' : 'css'
            });
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Get bundle statistics
   * @returns {Object} Bundle statistics
   */
  getStats() {
    const stats = {
      totalChunks: this.chunks.size,
      totalSize: 0,
      javascriptSize: 0,
      cssSize: 0,
      chunks: Array.from(this.chunks.entries())
    };

    this.chunks.forEach(chunk => {
      stats.totalSize += chunk.size;
      if (chunk.type === 'javascript') {
        stats.javascriptSize += chunk.size;
      } else if (chunk.type === 'css') {
        stats.cssSize += chunk.size;
      }
    });

    return stats;
  }
}

// Create singleton instances
const performanceMonitor = new PerformanceMonitor();
const lazyLoader = new LazyLoader();
const imageOptimizer = new ImageOptimizer();
const bundleAnalyzer = new BundleAnalyzer();

export {
  PerformanceMonitor,
  LazyLoader,
  ImageOptimizer,
  BundleAnalyzer,
  performanceMonitor,
  lazyLoader,
  imageOptimizer,
  bundleAnalyzer
};