/**
 * Performance Monitoring Service
 *
 * A comprehensive utility for tracking, measuring, and reporting application performance.
 * Provides hooks for timing operations, recording metrics, and detecting slow operations.
 */

interface PerformanceTimingOptions {
  minThreshold?: number; // Minimum time (ms) to log
  maxThreshold?: number; // Time (ms) to consider slow
  category?: string; // Categorize the operation
  logToConsole?: boolean; // Whether to log to console
  sampleRate?: number; // % of operations to monitor (0-1)
  metadata?: Record<string, any>; // Additional context for the operation
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  category: string;
  isSlow: boolean;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private maxEntries = 100;
  private onSlowOperationCallbacks: ((entry: PerformanceEntry) => void)[] = [];

  private readonly defaultOptions: Required<PerformanceTimingOptions> = {
    minThreshold: 50, // Log operations that take >50ms
    maxThreshold: 200, // Operations >200ms are considered slow
    category: 'default',
    logToConsole: process.env.NODE_ENV === 'development',
    sampleRate: 0.1, // Monitor 10% of operations by default
    metadata: {},
  };

  constructor() {
    // Register to window performance if available
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Create observer for performance entries
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordPerformanceEntry(entry.name, entry.duration, {
                category: entry.name.split(':')[0] || 'measure',
              });
            }
          }
        });

        observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported', e);
      }
    }
  }

  /**
   * Time a function execution
   */
  async timeAsync<T>(
    name: string,
    fn: () => Promise<T>,
    options: PerformanceTimingOptions = {}
  ): Promise<T> {
    // Apply sampling
    const opts = { ...this.defaultOptions, ...options };

    if (Math.random() > opts.sampleRate) {
      return fn();
    }

    const startTime = performance.now();

    try {
      const result = await fn();

      const duration = performance.now() - startTime;
      this.recordTiming(name, duration, opts);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTiming(`${name}:error`, duration, {
        ...opts,
        metadata: {
          ...opts.metadata,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  /**
   * Time a synchronous function execution
   */
  time<T>(name: string, fn: () => T, options: PerformanceTimingOptions = {}): T {
    // Apply sampling
    const opts = { ...this.defaultOptions, ...options };

    if (Math.random() > opts.sampleRate) {
      return fn();
    }

    const startTime = performance.now();

    try {
      const result = fn();

      const duration = performance.now() - startTime;
      this.recordTiming(name, duration, opts);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTiming(`${name}:error`, duration, {
        ...opts,
        metadata: {
          ...opts.metadata,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(name: string): (options?: PerformanceTimingOptions) => number {
    const startTime = performance.now();

    // Create a performance mark
    if (typeof performance !== 'undefined' && 'mark' in performance) {
      performance.mark(`${name}:start`);
    }

    // Return a function to end timing
    return (options: PerformanceTimingOptions = {}) => {
      const duration = performance.now() - startTime;

      // Create a performance measure
      if (typeof performance !== 'undefined' && 'measure' in performance) {
        try {
          performance.measure(name, `${name}:start`);
        } catch (e) {
          // Ignore measure errors
        }
      }

      this.recordTiming(name, duration, options);
      return duration;
    };
  }

  /**
   * Manually record a timing entry
   */
  recordTiming(name: string, duration: number, options: PerformanceTimingOptions = {}): void {
    const opts = { ...this.defaultOptions, ...options };

    // Skip if below minimum threshold
    if (duration < opts.minThreshold) {
      return;
    }

    const isSlow = duration > opts.maxThreshold;

    // Record entry
    this.recordPerformanceEntry(name, duration, {
      category: opts.category,
      isSlow,
      metadata: opts.metadata,
    });

    // Log to console if enabled
    if (opts.logToConsole) {
      const message = `${name}: ${Math.round(duration)}ms`;

      if (isSlow) {
        console.warn(`🐌 Slow operation - ${message}`, opts.metadata);
      } else {
        console.log(`⏱️ ${message}`, opts.metadata);
      }
    }
  }

  /**
   * Internal method to record a performance entry
   */
  private recordPerformanceEntry(
    name: string,
    duration: number,
    options: {
      category?: string;
      isSlow?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    const {
      category = this.defaultOptions.category,
      isSlow = duration > this.defaultOptions.maxThreshold,
      metadata,
    } = options;

    const entry: PerformanceEntry = {
      name,
      startTime: Date.now() - duration,
      duration,
      category,
      isSlow,
      metadata,
    };

    // Add to entries
    this.entries.push(entry);

    // Limit size of entries array
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Notify callbacks for slow operations
    if (isSlow) {
      for (const callback of this.onSlowOperationCallbacks) {
        try {
          callback(entry);
        } catch (e) {
          console.error('Error in slow operation callback', e);
        }
      }
    }
  }

  /**
   * Register a callback for slow operations
   */
  onSlowOperation(callback: (entry: PerformanceEntry) => void): () => void {
    this.onSlowOperationCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.onSlowOperationCallbacks.indexOf(callback);
      if (index !== -1) {
        this.onSlowOperationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get all recorded entries
   */
  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by category
   */
  getEntriesByCategory(category: string): PerformanceEntry[] {
    return this.entries.filter((entry) => entry.category === category);
  }

  /**
   * Get slow entries
   */
  getSlowEntries(): PerformanceEntry[] {
    return this.entries.filter((entry) => entry.isSlow);
  }

  /**
   * Clear all entries
   */
  clearEntries(): void {
    this.entries = [];
  }

  /**
   * Report performance data to your backend
   */
  async reportToBackend(): Promise<void> {
    if (this.entries.length === 0) {
      return;
    }

    try {
      const slowEntries = this.getSlowEntries();

      if (slowEntries.length === 0) {
        return;
      }

      // Send slow entries to backend
      await fetch('/api/performance/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: slowEntries,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true,
      });
    } catch (e) {
      console.error('Error reporting performance data', e);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Send performance data before unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.reportToBackend();
  });
}
