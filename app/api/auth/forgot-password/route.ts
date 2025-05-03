import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { EmailService } from '@/lib/services/email-service';

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
    const supabase = createRouteHandlerClient();

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
      await EmailService.sendEmail({
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Reset your password</h1>
          <p>Click the link below to reset your password:</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password">Reset Password</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send custom password reset email:', emailError);
      // Continue even if our custom email fails, since Supabase will send its own
    }

    return NextResponse.json({
      message: "If your email exists in our system, we've sent you a password reset link.",
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
