import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { forgotPassword } from '@/lib/api/auth';
import { isSuccess } from '@/utils/result';
import { rateLimit } from '@/lib/rate-limit';
import { EmailService } from '@/lib/services/email-service';
import plunk from '@/app/lib/plunk';

// Validation schema for email
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Define the handler function to be rate-limited
  const handler = async () => {
    try {
      // Parse request body
      const body = await request.json();
      const { email } = body;

      // Validate email
      try {
        emailSchema.parse({ email });
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Invalid email format',
            details: error instanceof z.ZodError ? error.errors : undefined,
          },
          { status: 400 }
        );
      }

      // Call the API function
      const result = await forgotPassword({ email });

      if (!isSuccess(result)) {
        // For security reasons, we don't want to reveal if the email exists
        // or if there was a specific error, so we return a generic success message
        console.error('Forgot password error:', result.error);
        return NextResponse.json({
          message: "If your email exists in our system, we've sent you a password reset link.",
        });
      }

      // Also send a custom email using our EmailService
      try {
        await plunk.events.track({
          event: 'user_password_reset_requested',
          email,
          data: {
            name: email.split('@')[0],
            password_reset_link: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
            support_link: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/support`,
          },
        });
      } catch (plunkError) {
        console.error('Failed to trigger Plunk password reset event:', plunkError);
      }

      // Return success response
      return NextResponse.json({
        message: "If your email exists in our system, we've sent you a password reset link.",
      });
    } catch (error) {
      console.error('Unexpected error in forgot-password route:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  };

  // Apply rate limiting with 5 requests per 5 minutes
  return rateLimit.apply(request, 'forgot-password', handler, 5, 60 * 5) as Promise<NextResponse>;
}
