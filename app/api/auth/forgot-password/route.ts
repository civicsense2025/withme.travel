import { createSupabaseServerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateRequestMiddleware } from '@/utils/validation';
import { z } from 'zod';
import { validateRequestCsrfToken } from '@/utils/csrf';
import { EmailService } from '@/lib/services/email-service';

// Create schema to include CSRF token
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  csrfToken: z.string()
});

// Create a simple in-memory rate limiter
// This is a basic implementation for development
// In production, consider using Redis or another distributed store
const rateLimits = new Map<string, { count: number, resetAt: number }>();

// Helper function for rate limiting
async function checkRateLimit(ip: string): Promise<{ 
  success: boolean; 
  limit: number; 
  remaining: number;
  reset: number;
}> {
  const MAX_REQUESTS = 5;
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimits.get(ip);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateLimits.set(ip, entry);
  }
  
  // Increment count
  entry.count++;
  
  // Check if over limit
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  const success = entry.count <= MAX_REQUESTS;
  
  return {
    success,
    limit: MAX_REQUESTS,
    remaining,
    reset: entry.resetAt
  };
}

// Cleanup function to prevent memory leaks (runs every hour)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimits.entries()) {
    if (data.resetAt < now) {
      rateLimits.delete(ip);
    }
  }
}, 60 * 60 * 1000);

async function forgotPasswordHandler(req: Request, data: z.infer<typeof forgotPasswordSchema>) {
  try {
    // Get IP for rate limiting
    // Use X-Forwarded-For header or fallback to a default value for local development
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? 
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : 'unknown') :
      'localhost';
      
    // Check rate limit
    const { success, limit, reset, remaining } = await checkRateLimit(ip);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      });
    }
    
    // Validate CSRF token
    if (!validateRequestCsrfToken(req)) {
      return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
    }
    
    // Create Supabase client
    const supabase = await createSupabaseServerClient();
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      // Don't expose if the email exists or not for security reasons
      // Always return a success message
      return NextResponse.json({ 
        message: 'If your email exists in our system, we\'ve sent you a password reset link.' 
      });
    }
    
    // Also send a custom email using our EmailService
    try {
      await EmailService.sendPasswordResetEmail({
        to: data.email,
        resetUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
        expiresInHours: 24
      });
    } catch (emailError) {
      console.error('Failed to send custom password reset email:', emailError);
      // Continue even if our custom email fails, since Supabase will send its own
    }
    
    return NextResponse.json({ 
      message: 'If your email exists in our system, we\'ve sent you a password reset link.' 
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export const POST = validateRequestMiddleware(forgotPasswordSchema, forgotPasswordHandler); 