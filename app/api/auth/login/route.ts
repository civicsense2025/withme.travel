import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { captureException } from '@sentry/nextjs';
import { sanitizeAuthCredentials } from '@/utils/sanitize';
import { rateLimit } from '@/utils/middleware/rate-limit';
import { login } from '@/lib/api/auth';
import { isSuccess } from '@/utils/result';

// Simple schema for login validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Rate limiting configuration: 10 attempts per minute per IP
const loginRateLimiter = rateLimit({
  limit: 10,
  windowMs: 60 * 1000, // 1 minute
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    // Apply rate limiting - returns NextResponse if limit exceeded, undefined otherwise
    const rateLimitResponse = await loginRateLimiter(request);
    if (rateLimitResponse) {
      // Rate limit exceeded, return the 429 response
      return rateLimitResponse;
    }

    // Get and validate request body
    const body = await request.json().catch(() => ({}));

    try {
      loginSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors[0].message || 'Invalid login data' },
          { status: 400, headers: responseHeaders }
        );
      }

      return NextResponse.json(
        { error: 'Invalid login data' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Sanitize credentials
    const { email, password } = sanitizeAuthCredentials(body);

    // Use the API module
    const result = await login({ email, password });

    if (!isSuccess(result)) {
      console.error('Authentication error:', result.error);
      
      let errorMessage = result.error?.message || 'Authentication failed';
      let statusCode = 400;

      // Provide more user-friendly error messages
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'The email or password you entered is incorrect.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before logging in.';
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.';
        statusCode = 429;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode, headers: responseHeaders }
      );
    }

    // Return successful login response
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('Unexpected login error:', error);
    captureException(error);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: responseHeaders }
    );
  }
}
