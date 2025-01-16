class RequestCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  generateKey(prompt, modelId) {
    return `${prompt}:${modelId || 'default'}`;
  }

  set(prompt, modelId, value) {
    const key = this.generateKey(prompt, modelId);

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(prompt, modelId) {
    const key = this.generateKey(prompt, modelId);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();
