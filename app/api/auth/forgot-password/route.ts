import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { EmailService } from '@/lib/services/email-service';
import plunk from '@/app/lib/plunk';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email using zod schema
    const emailSchema = z.object({
      email: z.string().email('Please enter a valid email address'),
    });

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

    // Check rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

    // Create Supabase client
    const supabase = await createRouteHandlerClient();

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't expose if the email exists or not for security reasons
      // Always return a success message
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

    return NextResponse.json({
      message: "If your email exists in our system, we've sent you a password reset link.",
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
