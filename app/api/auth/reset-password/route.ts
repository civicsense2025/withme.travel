import { NextRequest, NextResponse } from 'next/server';
// import { createApiClient } from '@/utils/supabase/api';
import { z } from 'zod';
import { resetPassword } from '@/lib/api/auth';
import { isSuccess } from '@/utils/result';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeAuthCredentials } from '@/utils/sanitize';

// Define password reset validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  token: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Define handler for rate limiting
  const handler = async () => {
    try {
      // Set CORS headers
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });

      // Parse request body
      const body = await request.json();
      
      // Validate request data
      let validatedData;
      try {
        validatedData = resetPasswordSchema.parse(body);
      } catch (error) {
        // Handle validation errors
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

      // Sanitize credentials
      const { password } = sanitizeAuthCredentials(body);
      const token = validatedData.token || '';
      
      // Call the API function
      const result = await resetPassword({ password, token });

      if (!isSuccess(result)) {
        return NextResponse.json(
          {
            success: false,
            error: result.error.message || 'Failed to reset password'
          },
          { status: 400, headers }
        );
      }

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: 'Password has been successfully reset'
        },
        { headers }
      );
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Return generic error response
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred while resetting your password'
        },
        { status: 500 }
      );
    }
  };

  // Apply rate limiting - 5 attempts per 10 minutes
  return rateLimit.apply(
    request,
    'reset-password',
    handler,
    5,
    600
  ) as Promise<NextResponse>;
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
