/**
 * API Rate Limiter Utility
 *
 * A centralized utility for handling API rate limiting in Next.js API routes.
 * Designed for high-scale applications with 1k/5k/25k+ users.
 *
 * Features:
 * - Memory-based rate limiting (with optional Redis support)
 * - Multiple strategies (fixed window, sliding window)
 * - Configurable limits and windows
 * - Standard HTTP headers
 * - Built-in response formatter
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting strategies
export enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window', // Reset counter after window expires
  SLIDING_WINDOW = 'sliding_window', // Track requests over rolling time period
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  strategy?: RateLimitStrategy; // Limiting strategy to use
  keyGenerator?: (req: NextRequest, userId: string) => string; // Custom key generator
  headers?: boolean; // Whether to add headers
}

interface RateLimitRecord {
  count: number; // Number of requests in current window
  timestamps: number[]; // Timestamps of requests (for sliding window)
  timestamp: number; // Start of current window (for fixed window)
}

// Global in-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Memory cleanup - run every hour to clear old records
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove records older than 2 hours
      if (now - record.timestamp > 7200000) {
        rateLimitStore.delete(key);
      }
    }
  }, 3600000); // 1 hour
}

/**
 * Default key generator function
 * Creates a unique key for each user + IP combination
 */
function defaultKeyGenerator(req: NextRequest, userId: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  return `${userId}:${ip}`;
}

/**
 * Check if a request exceeds rate limits
 */
export function checkRateLimit(
  req: NextRequest,
  userId: string,
  options: RateLimitOptions
): { limited: boolean; record: RateLimitRecord; remaining: number } {
  const {
    windowMs = 60000, // Default: 1 minute
    maxRequests = 1000, // Default: 30 requests per minute
    strategy = RateLimitStrategy.FIXED_WINDOW,
    keyGenerator = defaultKeyGenerator,
    headers = true,
  } = options;

  const now = Date.now();
  const key = keyGenerator(req, userId);
  let record = rateLimitStore.get(key);

  // Initialize record if not exist
  if (!record) {
    record = {
      count: 0,
      timestamps: [],
      timestamp: now,
    };
    rateLimitStore.set(key, record);
  }

  let limited = false;
  let remaining = maxRequests;

  if (strategy === RateLimitStrategy.FIXED_WINDOW) {
    // Fixed window strategy
    if (now - record.timestamp > windowMs) {
      // Reset window
      record.count = 1;
      record.timestamp = now;
    } else {
      record.count++;
    }

    limited = record.count > maxRequests;
    remaining = Math.max(0, maxRequests - record.count);
  } else {
    // Sliding window strategy
    // Remove timestamps outside current window
    record.timestamps = record.timestamps.filter((ts) => now - ts <= windowMs);

    // Add current timestamp
    record.timestamps.push(now);
    record.timestamp = now;
    record.count = record.timestamps.length;

    limited = record.count > maxRequests;
    remaining = Math.max(0, maxRequests - record.count);
  }

  // Update the store
  rateLimitStore.set(key, record);

  return { limited, record, remaining };
}

/**
 * Generate appropriate headers for rate limiting
 */
export function generateRateLimitHeaders(record: RateLimitRecord, options: RateLimitOptions) {
  const { windowMs = 60000, maxRequests = 30 } = options;

  const remaining = Math.max(0, maxRequests - record.count);
  const resetTime = Math.ceil((record.timestamp + windowMs) / 1000);

  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
    'Retry-After': Math.ceil(windowMs / 1000).toString(),
  };
}

/**
 * Return a rate limited response
 */
export function rateLimitedResponse(record: RateLimitRecord, options: RateLimitOptions) {
  const headers = generateRateLimitHeaders(record, options);

  const response = NextResponse.json(
    { error: 'Too Many Requests', message: 'Rate limit exceeded' },
    { status: 429 }
  );

  // Add headers
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Apply rate limiting middleware to a handler
 *
 * @example
 * ```
 * export async function GET(req: NextRequest) {
 *   // Apply rate limiting
 *   const userId = '123'; // Get from authentication
 *   const rateLimitResult = applyRateLimit(req, userId, {
 *     windowMs: 60000,
 *     maxRequests: 10
 *   });
 *
 *   if (rateLimitResult) {
 *     return rateLimitResult; // Return 429 response
 *   }
 *
 *   // Continue with the request handling
 *   return NextResponse.json({ data: 'success' });
 * }
 * ```
 */
export function applyRateLimit(
  req: NextRequest,
  userId: string,
  options: RateLimitOptions
): NextResponse | null {
  const result = checkRateLimit(req, userId, options);

  if (result.limited) {
    return rateLimitedResponse(result.record, options);
  }

  // Add rate limit headers to the response
  if (options.headers !== false) {
    // Return null to indicate the request should proceed
    // The headers will be added by the handler
    return null;
  }

  return null;
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  record: RateLimitRecord,
  options: RateLimitOptions
) {
  const headers = generateRateLimitHeaders(record, options);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

// Predefined rate limits for common scenarios
export const RATE_LIMITS = {
  // For normal API calls
  STANDARD: {
    windowMs: 60000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },

  // For expensive operations
  STRICT: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },

  // For notifications - avoid flooding
  NOTIFICATIONS: {
    windowMs: 120000, // 2 minutes
    maxRequests: 15, // 15 requests per 2 minutes
  },

  // For uploads and resource-intensive operations
  UPLOADS: {
    windowMs: 300000, // 5 minutes
    maxRequests: 10, // 10 requests per 5 minutes
  },

  // For authentication attempts - prevents brute force
  AUTH: {
    windowMs: 300000, // 5 minutes
    maxRequests: 10, // 10 attempts per 5 minutes
  },
} as const;
