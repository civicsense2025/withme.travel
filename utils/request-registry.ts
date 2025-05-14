/**
 * Request Registry - A utility for managing and tracking API requests
 *
 * This registry helps prevent request flooding by tracking in-flight requests
 * and implementing circuit breaking patterns.
 */

interface RequestEntry {
  timestamp: number;
  inProgress: boolean;
  retryCount: number;
}

class RequestRegistry {
  private requests = new Map<string, RequestEntry>();
  private readonly maxRetries: number;

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;

    // Clean up old entries periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupOldEntries(), 5 * 60 * 1000); // Every 5 minutes
    }
  }

  /**
   * Check if a request can be made
   *
   * @param key Unique key identifying the request
   * @param cooldownMs Minimum time between requests in milliseconds
   * @returns Whether the request can be made
   */
  canMakeRequest(key: string, cooldownMs = 2000): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);

    // If request is already in progress, block duplicate
    if (entry?.inProgress) {
      console.debug(`[RequestRegistry] Blocking duplicate request: ${key}`);
      return false;
    }

    // If within cooldown period, block request
    if (entry && now - entry.timestamp < cooldownMs) {
      console.debug(`[RequestRegistry] Rate limiting request: ${key} (cooldown: ${cooldownMs}ms)`);
      return false;
    }

    // If previous attempts reached max retries, check for longer cooldown
    if (entry && entry.retryCount >= this.maxRetries) {
      const backoffCooldown = this.calculateBackoff(entry.retryCount ?? 0) * 1000;
      if (now - entry.timestamp < backoffCooldown) {
        console.debug(`[RequestRegistry] Circuit breaking: ${key} (backoff: ${backoffCooldown}ms)`);
        return false;
      }
    }

    // Create or update the request entry
    this.requests.set(key, {
      timestamp: now,
      inProgress: true,
      retryCount: entry ? entry.retryCount : 0,
    });

    return true;
  }

  /**
   * Mark a request as completed successfully
   *
   * @param key Unique key identifying the request
   */
  completeRequest(key: string): void {
    const entry = this.requests.get(key);
    if (entry) {
      // Reset retry count on success
      this.requests.set(key, {
        ...entry,
        inProgress: false,
        retryCount: 0,
      });
    }
  }

  /**
   * Mark a request as failed
   *
   * @param key Unique key identifying the request
   * @param isRetryable Whether this error type should trigger a retry
   */
  failRequest(key: string, isRetryable = true): void {
    const entry = this.requests.get(key);
    if (entry) {
      // Increment retry count for retryable errors
      this.requests.set(key, {
        ...entry,
        inProgress: false,
        retryCount: isRetryable ? entry.retryCount + 1 : entry.retryCount,
      });
    }
  }

  /**
   * Calculate exponential backoff time based on retry count
   *
   * @param retryCount Number of previous retries
   * @returns Backoff time in seconds
   */
  private calculateBackoff(retryCount: number): number {
    // Base backoff: 2^retry * 1s with jitter
    // Example: retry 1 = 2s, retry 2 = 4s, retry 3 = 8s...
    const baseBackoff = Math.pow(2, Math.min(retryCount, 8));
    const jitter = Math.random() * 0.5 + 0.5; // 0.5-1.0 jitter factor

    return baseBackoff * jitter;
  }

  /**
   * Clean up entries older than 1 hour
   */
  private cleanupOldEntries(): void {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    for (const [key, entry] of this.requests.entries()) {
      if (now - entry.timestamp > ONE_HOUR) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Get statistics about current requests
   */
  getStats(): { totalTracked: number; inProgress: number; maxRetries: number } {
    let inProgressCount = 0;
    let maxRetriesCount = 0;

    for (const entry of this.requests.values()) {
      if (entry.inProgress) inProgressCount++;
      if (entry.retryCount >= this.maxRetries) maxRetriesCount++;
    }

    return {
      totalTracked: this.requests.size,
      inProgress: inProgressCount,
      maxRetries: maxRetriesCount,
    };
  }
}

// Create a global instance
export const globalRequestRegistry = new RequestRegistry();

/**
 * Wrapper function to make a fetch request with registry tracking
 *
 * @param url Request URL
 * @param options Fetch options
 * @param key Optional custom key (defaults to URL)
 * @param cooldownMs Cooldown period in ms
 * @returns Fetch response
 */
export async function registeredFetch(
  url: string,
  options: RequestInit = {},
  key?: string,
  cooldownMs = 2000
): Promise<Response> {
  const requestKey = key || url;

  // Check if request can be made
  if (!globalRequestRegistry.canMakeRequest(requestKey, cooldownMs)) {
    throw new Error('Request rate limited by registry');
  }

  try {
    const response = await fetch(url, options);

    // Handle rate limiting specially
    if (response.status === 429) {
      // Get retry-after header if available
      const retryAfter = response.headers.get('Retry-After');
      const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000; // Default to 60s

      console.warn(
        `[RequestRegistry] Rate limited by server for: ${requestKey}, retry after ${retryMs}ms`
      );
      globalRequestRegistry.failRequest(requestKey, true);
      throw new Error(`Request rate limited by server (retry after ${retryMs}ms)`);
    }

    // Mark request as completed if successful
    if (response.ok) {
      globalRequestRegistry.completeRequest(requestKey);
    } else {
      // For server errors (5xx), mark as retryable
      // For client errors (4xx), mark as non-retryable (except 429 handled above)
      const isServerError = response.status >= 500;
      globalRequestRegistry.failRequest(requestKey, isServerError);
    }

    return response;
  } catch (error) {
    // For network errors, mark as retryable
    globalRequestRegistry.failRequest(requestKey, true);
    throw error;
  }
}

/**
 * Create a key for a request based on path and query parameters
 */
export function createRequestKey(path: string, params?: Record<string, any>): string {
  if (!params) return path;

  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .filter((key) => params[key] !== undefined)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Hook to get the request registry
 * (Useful for testing and debugging)
 */
export function useRequestRegistry() {
  return globalRequestRegistry;
}
