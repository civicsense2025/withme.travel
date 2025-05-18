/**
 * Rate Limiting Utility
 *
 * This utility provides a way to limit the rate of API requests
 * based on tokens like IP addresses or user IDs. It uses an in-memory
 * store but can be extended to use Redis or other persistent stores.
 */

interface Options {
  interval: number; // Time window in milliseconds
  limit: number; // Maximum number of requests per interval
  uniqueTokenPerInterval?: number; // Max number of unique tokens to track per interval
}

interface TokenEntry {
  tokens: {
    [token: string]: number;
  };
  createdAt: number;
}

/**
 * Rate limiting implementation
 * @param options Configuration options for rate limiting
 * @returns Rate limiter object with check method
 */
export function rateLimit(options: Options) {
  const { interval, limit, uniqueTokenPerInterval = 500 } = options;
  const tokenCache = new Map<string, TokenEntry>();

  // Clean up old tokens periodically
  const cleanup = setInterval(() => {
    const now = Date.now();
    tokenCache.forEach((entry, key) => {
      if (now - entry.createdAt > interval) {
        tokenCache.delete(key);
      }
    });
  }, interval);

  // Ensure cleanup doesn't prevent the process from exiting
  if (cleanup.unref) {
    cleanup.unref();
  }

  return {
    /**
     * Check if the request is within rate limits
     * @param maxRequests Maximum number of requests allowed
     * @param key Unique identifier for this limit (e.g., endpoint:IP)
     * @returns Promise that resolves if under limit, rejects if over limit
     */
    check: async (maxRequests: number, key: string): Promise<void> => {
      const tokenKey = key;
      const now = Date.now();

      // Initialize or update token cache entry
      if (!tokenCache.has(tokenKey)) {
        tokenCache.set(tokenKey, {
          tokens: {},
          createdAt: now,
        });
      }

      const currentUsage = tokenCache.get(tokenKey)!;
      const currentCount = currentUsage.tokens[key] || 0;

      // Check if we're over the limit
      const requestLimit = maxRequests || limit;
      if (currentCount >= requestLimit) {
        return Promise.reject(new Error('Rate limit exceeded'));
      }

      // Increment the count
      currentUsage.tokens[key] = currentCount + 1;

      // Clean up if we have too many unique tokens
      if (Object.keys(currentUsage.tokens).length > uniqueTokenPerInterval) {
        // Remove the oldest tokens (this is a simple approximation)
        const keys = Object.keys(currentUsage.tokens);
        const oldestKey = keys[0];
        delete currentUsage.tokens[oldestKey];
      }

      return Promise.resolve();
    },
  };
}
