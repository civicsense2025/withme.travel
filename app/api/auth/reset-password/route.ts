import { NextRequest, NextResponse } from 'next/server';
// import { createApiClient } from '@/utils/supabase/api';
import { z } from 'zod';
import { resetPasswordSchema } from '@/utils/validation';
import { EmailService } from '@/lib/services/email-service';
import { captureException } from '@sentry/nextjs';
// import { createServerSupabaseClient } from '@/utils/supabase/server'; // Old import
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeAuthCredentials } from '@/utils/sanitize';

// Define interface for email service results
interface EmailResult {
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Set security headers for all responses
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
  });

  try {
    // Create a handler function that returns NextResponse
    const handler = async (): Promise<NextResponse> => {
      try {
        // Check rate limiting first
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = `reset-password_${ip}`;
        const MAX_REQUESTS = 5;
        const WINDOW_SECONDS = 60;

        // Manual rate limiting implementation
        const now = Date.now();
        const windowKey = Math.floor(now / (WINDOW_SECONDS * 1000));
        const cacheKey = `${rateLimitKey}_${windowKey}`;

        // Use a simple object to track rate limits (in a real app, you would use Redis or similar)
        const rateLimitCache: Record<string, number> = {};
        const currentCount = rateLimitCache[cacheKey] || 0;

        if (currentCount >= MAX_REQUESTS) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers }
          );
        }

        // Increment the counter
        rateLimitCache[cacheKey] = currentCount + 1;

        // Parse request body
        let body;
        try {
          body = await request.json();
        } catch (error) {
          console.error('Failed to parse request body:', error);
          captureException(error);
          return NextResponse.json({ error: 'Invalid request format' }, { status: 400, headers });
        }

        // Validate request body
        let validatedData: z.infer<typeof resetPasswordSchema>;
        try {
          validatedData = resetPasswordSchema.parse(body);
        } catch (error) {
          console.error('Reset Password Validation Error:', error);
          captureException(error);
          // Handle Zod validation errors
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid input data',
                issues: error.issues,
              },
              { status: 400, headers }
            );
          }
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid request body',
            },
            { status: 400, headers }
          );
        }

        const { password } = sanitizeAuthCredentials(body);

        try {
          // Create Supabase client using our utility
          const supabase = await createRouteHandlerClient();

          // Get current user securely (session after recovery link should be valid)
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return NextResponse.json(
              {
                success: false,
                error:
                  userError?.message ||
                  'Invalid session. Please request a new password reset link.',
              },
              { status: 401, headers }
            );
          }

          // Update user's password
          const {
            data: { user: userData },
            error,
          } = await supabase.auth.updateUser({
            password: password,
          });

          if (error) {
            console.error('Supabase Update User Error:', error.message);
            captureException(error);

            // Provide more specific error messages if possible
            let clientErrorMessage = 'Failed to update password. Please try again.';
            if (error.message.includes('Password should be at least 6 characters')) {
              clientErrorMessage = 'Password must be at least 8 characters.'; // Align with schema
            } else if (error.message.includes('session could not be refreshed')) {
              clientErrorMessage =
                'Your session has expired. Please request a new password reset link.';
            }
            return NextResponse.json({ error: clientErrorMessage }, { status: 400, headers });
          }

          // Send password reset confirmation email
          try {
            if (userData?.email) {
              // Use the generic sendEmail method for confirmation
              const userName = userData.user_metadata?.name || 'there';
              const subject = 'Your WithMe Travel Password Has Been Reset';
              const body = `
                <h1>Password Reset Successful</h1>
                <p>Hello ${userName},</p>
                <p>Your password for your WithMe Travel account has been successfully reset.</p>
                <p>If you did not make this change, please contact support immediately.</p>
                <p>The WithMe Travel Team</p>
              `;

              // Convert boolean result to EmailResult object
              const emailSent = await EmailService.sendEmail({
                to: userData.email,
                subject,
                html: body,
              });

              // Create proper EmailResult from boolean
              const emailResult: EmailResult = {
                success: Boolean(emailSent),
                error: emailSent ? undefined : 'Failed to send email',
              };

              if (!emailResult.success) {
                // Log but continue - don't fail the password reset just because email failed
                console.error(
                  'Failed to send password reset confirmation email:',
                  emailResult.error
                );
                captureException(emailResult.error);
              }
            }
          } catch (emailError) {
            // Log but continue - don't fail the password reset just because email failed
            console.error('Failed to send password reset confirmation email:', emailError);
            captureException(emailError);
          }

          // Return success response with consistent format
          return NextResponse.json(
            {
              success: true,
              message: 'Password has been successfully reset',
              user: {
                id: userData?.id,
                email: userData?.email,
              },
            },
            { headers }
          );
        } catch (error) {
          console.error('Reset password error:', error);
          captureException(error);

          return NextResponse.json(
            {
              success: false,
              error: 'An unexpected error occurred while resetting your password',
            },
            { status: 500, headers }
          );
        }
      } catch (error) {
        console.error('Inner handler error:', error);
        captureException(error);
        return NextResponse.json(
          {
            success: false,
            error: 'An unexpected error occurred',
          },
          { status: 500, headers }
        );
      }
    };

    // Apply rate limiting to the handler
    return (await rateLimit.apply(
      request,
      'reset-password',
      handler,
      5, // max requests
      60 // window in seconds
    )) as NextResponse;
  } catch (error) {
    console.error('Rate limit error:', error);
    captureException(error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500, headers }
    );
  }
}
