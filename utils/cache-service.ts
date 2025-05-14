/**
 * Cache Service - Versatile client-side caching solution
 *
 * A comprehensive utility for caching data with support for different storage mechanisms,
 * expiration policies, versions, and invalidation strategies.
 */

type StorageType = 'memory' | 'localStorage' | 'sessionStorage';

interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds
  storage?: StorageType;
  version?: string; // For cache invalidation
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  version: string;
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultOptions: Required<CacheOptions> = {
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: 'memory',
    version: 'v1',
  };

  constructor(private globalVersion: string = 'v1') {
    // Set up periodic cleanup
    if (typeof window !== 'undefined') {
      // Clean up every 10 minutes
      setInterval(() => this.cleanup(), 10 * 60 * 1000);
    }
  }

  /**
   * Get a value from cache, or fetch it if not available
   *
   * @param key Cache key
   * @param fetchFn Optional function to fetch data if not in cache
   * @param options Cache options
   * @returns Cached value or null if not available
   */
  async get<T>(key: string, fetchFn?: () => Promise<T>, options?: CacheOptions): Promise<T | null> {
    const opts = { ...this.defaultOptions, ...options };
    const fullKey = `${opts.version}:${key}`;

    // Try to get from cache
    const cachedValue = this.getFromCache<T>(fullKey, opts);

    if (cachedValue !== null) {
      return cachedValue;
    }

    // If no fetch function, return null
    if (!fetchFn) {
      return null;
    }

    // Fetch and cache
    try {
      const value = await fetchFn();
      this.set(key, value, opts);
      return value;
    } catch (error) {
      console.error('Error fetching data for cache:', error);
      throw error;
    }
  }

  /**
   * Store a value in cache
   *
   * @param key Cache key
   * @param value Value to store
   * @param options Cache options
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    const fullKey = `${opts.version}:${key}`;
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      version: opts.version,
    };

    // Store according to storage option
    switch (opts.storage) {
      case 'localStorage':
        try {
          localStorage.setItem(fullKey, JSON.stringify(entry));
        } catch (e) {
          console.warn('Error storing in localStorage, falling back to memory cache', e);
          this.memoryCache.set(fullKey, entry);
        }
        break;

      case 'sessionStorage':
        try {
          sessionStorage.setItem(fullKey, JSON.stringify(entry));
        } catch (e) {
          console.warn('Error storing in sessionStorage, falling back to memory cache', e);
          this.memoryCache.set(fullKey, entry);
        }
        break;

      case 'memory':
      default:
        this.memoryCache.set(fullKey, entry);
        break;
    }
  }

  /**
   * Remove a specific item from cache
   *
   * @param key Cache key
   * @param options Cache options
   */
  invalidate(key: string, options?: CacheOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    const fullKey = `${opts.version}:${key}`;

    // Remove from all storage types to be safe
    this.memoryCache.delete(fullKey);

    try {
      localStorage.removeItem(fullKey);
      sessionStorage.removeItem(fullKey);
    } catch (e) {
      // Ignore storage access errors
    }
  }

  /**
   * Remove all items with keys starting with the given prefix
   *
   * @param prefix Key prefix
   * @param options Cache options
   */
  invalidateByPrefix(prefix: string, options?: CacheOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    const fullPrefix = `${opts.version}:${prefix}`;

    // Memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(fullPrefix)) {
        this.memoryCache.delete(key);
      }
    }

    // LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Ignore storage access errors
    }

    // SessionStorage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Ignore storage access errors
    }
  }

  /**
   * Remove all cached items
   */
  invalidateAll(): void {
    // Clear memory cache
    this.memoryCache.clear();

    // Update global version to invalidate all future lookups
    this.globalVersion = `v${Date.now()}`;

    // Try to clear storages
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore storage access errors
    }
  }

  /**
   * Get item from cache, respecting TTL
   */
  private getFromCache<T>(fullKey: string, options: Required<CacheOptions>): T | null {
    const now = Date.now();
    let entry: CacheEntry<T> | null = null;

    // Check the appropriate storage
    switch (options.storage) {
      case 'localStorage':
        try {
          const storedValue = localStorage.getItem(fullKey);
          if (storedValue) {
            entry = JSON.parse(storedValue) as CacheEntry<T>;
          }
        } catch (e) {
          // If localStorage fails, fall back to memory cache
          entry = (this.memoryCache.get(fullKey) as CacheEntry<T>) || null;
        }
        break;

      case 'sessionStorage':
        try {
          const storedValue = sessionStorage.getItem(fullKey);
          if (storedValue) {
            entry = JSON.parse(storedValue) as CacheEntry<T>;
          }
        } catch (e) {
          // If sessionStorage fails, fall back to memory cache
          entry = (this.memoryCache.get(fullKey) as CacheEntry<T>) || null;
        }
        break;

      case 'memory':
      default:
        entry = (this.memoryCache.get(fullKey) as CacheEntry<T>) || null;
        break;
    }

    // Check if entry exists and is valid
    if (entry === null) {
      return null;
    }

    // Check if entry is expired
    if (now - entry.timestamp > options.ttl) {
      this.invalidate(fullKey.substring(options.version.length + 1), options);
      return null;
    }

    // Check if version matches
    if (entry.version !== options.version) {
      this.invalidate(fullKey.substring(options.version.length + 1), options);
      return null;
    }

    return entry.value;
  }

  /**
   * Clean up expired entries from all storages
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      const keyParts = key.split(':');

      if (keyParts.length >= 2) {
        const version = keyParts[0];

        // Check if entry should be removed
        if (
          version !== this.globalVersion || // Old version
          now - entry.timestamp > this.defaultOptions.ttl // Default expiry
        ) {
          this.memoryCache.delete(key);
        }
      }
    }

    // Clean localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.includes(':')) {
          const keyParts = key.split(':');
          const version = keyParts[0];

          if (version !== this.globalVersion) {
            localStorage.removeItem(key);
            continue;
          }

          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}');

            if (entry.timestamp && now - entry.timestamp > this.defaultOptions.ttl) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid JSON, remove the item
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Clean sessionStorage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);

        if (key && key.includes(':')) {
          const keyParts = key.split(':');
          const version = keyParts[0];

          if (version !== this.globalVersion) {
            sessionStorage.removeItem(key);
            continue;
          }

          try {
            const entry = JSON.parse(sessionStorage.getItem(key) || '{}');

            if (entry.timestamp && now - entry.timestamp > this.defaultOptions.ttl) {
              sessionStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid JSON, remove the item
            sessionStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    localStorageEntries: number;
    sessionStorageEntries: number;
  } {
    let localStorageCount = 0;
    let sessionStorageCount = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.globalVersion}:`)) {
          localStorageCount++;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(`${this.globalVersion}:`)) {
          sessionStorageCount++;
        }
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }

    return {
      memoryEntries: this.memoryCache.size,
      localStorageEntries: localStorageCount,
      sessionStorageEntries: sessionStorageCount,
    };
  }
}

// Create a global instance
export const globalCache = new CacheService();
