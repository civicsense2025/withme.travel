import { NextRequest, NextResponse } from 'next/server';

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
const DEFAULT_MAX_REQUESTS = 1000;
const DEFAULT_WINDOW_SEC = 60;

// Higher limits for admin endpoints
const ADMIN_MAX_REQUESTS = 2000;
const ADMIN_WINDOW_SEC = 30;

/**
 * Clean up old rate limit records periodically
 * This prevents memory leaks from accumulating old records
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of windows.entries()) {
    // Remove records older than 1 hour (3600000ms)
    if (now - record.start > 3600000) {
      windows.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimits, 300000);

/**
 * Apply rate limiting to a request
 * @param request The incoming request
 * @param uniqueKey A unique key to identify the user/resource
 * @param maxRequests Maximum requests allowed in the window
 * @param windowSec Window size in seconds
 * @returns Result of the rate limiting check
 */
async function applyRateLimit(
  request: NextRequest,
  uniqueKey: string,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowSec = DEFAULT_WINDOW_SEC
): Promise<RateLimitResult> {
  // Get client IP or use fallback
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowKey = `${ip}:${uniqueKey}`;

  // Get or create window record
  let record = windows.get(windowKey);
  if (!record || now - record.start > windowMs) {
    record = { count: 0, start: now };
    windows.set(windowKey, record);
  }

  // Increment request count
  record.count++;

  // Calculate reset time (in seconds)
  const resetTime = Math.ceil((record.start + windowMs - now) / 1000);

  // Check if rate limit exceeded
  const limited = record.count > maxRequests;

  return {
    success: !limited,
    remaining: limited ? 0 : maxRequests - record.count,
    reset: resetTime > 0 ? resetTime : 0,
    limit: maxRequests,
  };
}

/**
 * Apply standard rate limiting to a request and return 429 if exceeded
 */
export async function applyLimit<T>(
  request: NextRequest,
  uniqueKey: string,
  handler: () => Promise<T>,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowSec = DEFAULT_WINDOW_SEC
): Promise<T | Response> {
  const result = await applyRateLimit(request, uniqueKey, maxRequests, windowSec);

  if (!result.success) {
    // Set rate limit headers
    const headers = new Headers();
    headers.set('Retry-After', result.reset.toString());
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toString());

    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: result.reset },
      { status: 429, headers }
    );
  }

  return await handler();
}

/**
 * Apply higher rate limiting for admin routes
 * Admin routes need higher limits due to dashboard polling and multiple parallel requests
 */
export async function applyAdminLimit<T>(
  request: NextRequest,
  uniqueKey: string,
  handler: () => Promise<T>
): Promise<T | Response> {
  return applyLimit(request, uniqueKey, handler, ADMIN_MAX_REQUESTS, ADMIN_WINDOW_SEC);
}

// Export the rate limiting utility
export const rateLimit = {
  apply: applyLimit,
  applyAdminLimit,
};
