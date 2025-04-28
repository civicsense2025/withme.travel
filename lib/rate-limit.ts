import { NextResponse } from 'next/server';

// Define interface for rate limit results
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

// In-memory store for rate limit windows
type WindowRecord = { count: number; start: number };
const windows = new Map<string, WindowRecord>();

// Default rate limit settings
const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_SEC = 60;

/**
 * Clean up old rate limit records periodically
 * This prevents memory leaks from accumulating old records
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of windows.entries()) {
    // Remove entries older than 2x the window size to ensure they're fully expired
    if (now - record.start > 2 * DEFAULT_WINDOW_SEC * 1000) {
      windows.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Rate limit utility with sliding window algorithm.
 */
export const rateLimit = {
  /**
   * Check if a request should be rate limited
   * @param key Unique key to identify the rate limit bucket (e.g., user IP).
   * @param maxRequests Maximum allowed requests in the window.
   * @param windowSec Time window in seconds.
   * @returns An object with success flag, remaining quota, and reset time.
   */
  async limit(
    key: string,
    maxRequests: number = DEFAULT_MAX_REQUESTS,
    windowSec: number = DEFAULT_WINDOW_SEC
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSec * 1000;
    let record = windows.get(key);

    // If no record exists or window has elapsed, reset the bucket
    if (!record || now - record.start > windowMs) {
      record = { count: 1, start: now };
      windows.set(key, record);
    } else {
      record.count++;
    }

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - record.count);
    const reset = Math.ceil((windowMs - (now - record.start)) / 1000);
    const success = record.count <= maxRequests;

    return { success, remaining, reset, limit: maxRequests };
  },

  /**
   * Apply rate limiting to a request and return appropriate response if limited
   * @param req The incoming request object
   * @param key The rate limit key (eg, IP address, user ID, etc)
   * @param maxRequests Maximum requests allowed in the window
   * @param windowSec Window size in seconds
   * @returns NextResponse if rate limited, null if the request should proceed
   */
  async applyLimit(
    req: Request,
    key: string,
    maxRequests: number = DEFAULT_MAX_REQUESTS,
    windowSec: number = DEFAULT_WINDOW_SEC
  ): Promise<NextResponse | null> {
    const result = await this.limit(key, maxRequests, windowSec);

    // Add rate limit headers to the response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', maxRequests.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toString());

    if (!result.success) {
      headers.set('Retry-After', result.reset.toString());
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429, // Too Many Requests
          headers
        }
      );
    }

    return null;
  }
};