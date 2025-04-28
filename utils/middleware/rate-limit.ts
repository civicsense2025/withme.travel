import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, consider using Redis or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up the store periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitOptions {
  // Maximum number of requests allowed within the window
  limit: number;
  // Time window in seconds
  windowMs: number;
  // Optional identifier function to determine rate limit key
  identifierFn?: (req: NextRequest) => string;
}

/**
 * Rate limiting middleware for Next.js API routes
 * 
 * @param options Rate limiting options (limit, window, identifier)
 * @returns NextResponse or undefined if not rate limited
 */
export function rateLimit(options: RateLimitOptions) {
  const { limit, windowMs } = options;
  
  return async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | undefined> {
    // Get a unique identifier for the requester (IP by default)
    const identifier = options.identifierFn 
      ? options.identifierFn(req) 
      : getIpAddress(req);

    const key = `${req.nextUrl.pathname}:${identifier}`;
    const now = Date.now();

    // Initialize or update the rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs * 1000
      };
    } else {
      store[key].count += 1;
    }

    // Set headers for rate limit info
    const remainingRequests = Math.max(0, limit - store[key].count);
    const resetTime = new Date(store[key].resetTime).toUTCString();
    
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', remainingRequests.toString());
    headers.set('X-RateLimit-Reset', resetTime);

    // If over the limit, return a 429 Too Many Requests response
    if (store[key].count > limit) {
      console.warn(`Rate limit exceeded for ${key}`);
      
      headers.set('Retry-After', Math.ceil((store[key].resetTime - now) / 1000).toString());
      
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: headers,
        }
      );
    }

    // Return undefined to continue to the next middleware or API route handler
    return undefined;
  };
}

/**
 * Get the client IP address from the request
 */
function getIpAddress(req: NextRequest): string {
  // Try to get the real client IP from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  // Get the first IP if x-forwarded-for contains multiple
  const forwardedIp = forwarded?.split(',')[0].trim();
  
  // Return the first available IP - using connectingAddress() for NextRequest
  const connectionAddress = req.headers.get('x-forwarded-for') || 
                           req.headers.get('x-real-ip') ||
                           '127.0.0.1';

  return forwardedIp || realIp || connectionAddress;
}

/**
 * Apply rate limiting to an API route handler
 * 
 * @param handler Your API route handler function
 * @param options Rate limiting options
 * @returns Handler with rate limiting applied
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: RateLimitOptions
) {
  const rateLimitMiddleware = rateLimit(options);
  
  return async function handleWithRateLimit(req: NextRequest): Promise<NextResponse> {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(req);
    
    // If rate limited, return the rate limit response
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Otherwise, continue to the handler
    return await handler(req);
  };
} 