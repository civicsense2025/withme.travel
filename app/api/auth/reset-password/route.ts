import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateRequestMiddleware } from '@/utils/validation';
import { z } from 'zod';
import { validateRequestCsrfToken } from '@/utils/csrf';
import { EmailService } from '@/lib/services/email-service';

// Create reset password schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  csrfToken: z.string()
});

async function resetPasswordHandler(req: Request, data: z.infer<typeof resetPasswordSchema>) {
  try {
    // Validate CSRF token
    if (!validateRequestCsrfToken(req)) {
      return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
    }
    
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, expires: new Date(0) });
          },
        },
      }
    );
    
    // Get current session (the user should be authenticated with the recovery link)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No active session. Please request a new password reset link.' 
      }, { status: 401 });
    }
    
    // Update user's password
    const { error, data: userData } = await supabase.auth.updateUser({
      password: data.password
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Send password reset confirmation email
    try {
      if (userData?.user?.email) {
        await EmailService.sendEmail(
          userData.user.email,
          'Your password has been reset',
          `
          <h1>Password Reset Successful</h1>
          <p>Hello,</p>
          <p>Your password for WithMe Travel has been successfully reset.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <p>The WithMe Travel Team</p>
          `,
          true
        );
      }
    } catch (emailError) {
      console.error('Failed to send password reset confirmation email:', emailError);
      // Continue even if email fails
    }
    
    return NextResponse.json({ 
      message: 'Password has been successfully reset'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export const POST = validateRequestMiddleware(resetPasswordSchema, resetPasswordHandler); 