import { getRouteHandlerClient } from '@/utils/supabase/unified';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
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
    const supabase = await getRouteHandlerClient();

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
      await EmailService.sendPasswordResetEmail({
        to: email,
        resetUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
        expiresInHours: 24,
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
