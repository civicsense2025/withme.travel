import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCsrfToken, createCsrfCookie } from '@/utils/csrf';
import { rateLimit } from '@/utils/middleware/rate-limit';

// Rate limiting for CSRF token requests
// 30 tokens per 5 minutes per IP
const csrfRateLimiter = rateLimit({
  limit: 30,
  windowMs: 300, // 5 minutes
});

/**
 * Handler for CSRF token generation endpoint
 */
export async function GET(request: Request) {
  // Apply rate limiting to prevent abuse
  const rateLimitResult = await csrfRateLimiter(request as any);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  try {
    // Generate a new CSRF token
    const csrfToken = generateCsrfToken();
    
    // Create CSRF cookie
    const csrfCookie = createCsrfCookie(csrfToken);
    
    // Return the token in the response with the cookie
    const response = NextResponse.json({ 
      token: csrfToken.token,
      expires: csrfToken.expires
    });
    
    // Set cookie header
    response.headers.set('Set-Cookie', csrfCookie);
    
    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 });
  }
} 