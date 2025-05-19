import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';
import { errorResponse } from './api-utils';

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[lib/auth-middleware] Supabase URL or Service Key is missing.');
}

// Create a single instance of the Supabase admin client for this module
const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient<Database>(supabaseUrl, serviceKey) : null;

/**
 * Type for user data returned from auth endpoints
 */
export interface AuthUser {
  id: string;
  email?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  authorized: boolean;
  user?: AuthUser;
  error?: string;
  response?: NextResponse;
}

/**
 * Log authentication errors with structured information
 */
function logAuthError(context: string, error: unknown, request?: NextRequest) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorObject = {
    context,
    message: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    url: request?.url,
    method: request?.method,
  };
  
  console.error('[auth-middleware] Authentication error:', errorObject);
  return errorMessage;
}

/**
 * Middleware to require authentication
 * Returns user data if authenticated or error response if not
 */
export async function requireAuth(request?: NextRequest): Promise<AuthResult> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[requireAuth] Missing Supabase credentials');
      return {
        authorized: false,
        error: 'Server configuration error',
        response: errorResponse('Server configuration error', 500),
      };
    }
    
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logAuthError('requireAuth', error, request);
      return {
        authorized: false,
        error: error.message,
        response: errorResponse('Unauthorized', 401),
      };
    }

    if (!user) {
      return {
        authorized: false,
        error: 'No authenticated user found',
        response: errorResponse('Unauthorized', 401),
      };
    }

    return { 
      authorized: true, 
      user: user as AuthUser
    };
  } catch (error) {
    const errorMessage = logAuthError('requireAuth', error, request);
    
    return {
      authorized: false,
      error: 'Internal server error during authentication',
      response: errorResponse('Internal server error', 500),
    };
  }
}

/**
 * Check if current user has admin privileges
 */
export async function requireAdmin(request?: NextRequest): Promise<AuthResult> {
  const authResult = await requireAuth(request);

  if (!authResult.authorized || !authResult.user) {
    return authResult;
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[requireAdmin] Missing Supabase credentials');
      return {
        authorized: false,
        error: 'Server configuration error',
        response: errorResponse('Server configuration error', 500),
      };
    }
    
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authResult.user.id)
      .single();

    if (error) {
      logAuthError('requireAdmin', error, request);
      return {
        authorized: false,
        error: 'Failed to verify admin status',
        response: errorResponse('Admin access verification failed', 500),
      };
    }

    if (!profile || !profile.is_admin) {
      return {
        authorized: false,
        error: 'Admin access required',
        response: errorResponse('Admin access required', 403),
      };
    }

    return { authorized: true, user: authResult.user };
  } catch (error) {
    const errorMessage = logAuthError('requireAdmin', error, request);
    
    return {
      authorized: false,
      error: 'Internal server error during authorization',
      response: errorResponse('Internal server error', 500),
    };
  }
}

/**
 * Helper to handle auth within route handlers
 * @param handler - The function to run if authenticated
 */
export async function withAuth<T>(handler: (user: AuthUser) => Promise<T>, request?: NextRequest): Promise<T | NextResponse> {
  const result = await requireAuth(request);
  
  if (!result.authorized || !result.user) {
    return result.response as NextResponse;
  }
  
  return handler(result.user);
}

/**
 * Helper to handle admin auth within route handlers
 * @param handler - The function to run if an admin
 */
export async function withAdmin<T>(handler: (user: AuthUser) => Promise<T>, request?: NextRequest): Promise<T | NextResponse> {
  const result = await requireAdmin(request);
  
  if (!result.authorized || !result.user) {
    return result.response as NextResponse;
  }
  
  return handler(result.user);
}

// Function to check if the user is authenticated
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error('[isAuthenticated] Supabase client not initialized.');
    return false;
  }
  
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser();
    
    return !!user;
  } catch (error) {
    logAuthError('isAuthenticated', error, request);
    return false;
  }
}

// Middleware function to protect routes
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    if (!supabaseAdmin) {
      console.error('[authMiddleware] Supabase client not initialized.');
      const redirectUrl = new URL('/login?error=auth_setup_failed', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    const {
      data: { user },
      error
    } = await supabaseAdmin.auth.getUser();

    if (error) {
      logAuthError('authMiddleware', error, request);
      const redirectUrl = new URL('/login?error=auth_error', request.url);
      redirectUrl.searchParams.set('message', encodeURIComponent(error.message));
      return NextResponse.redirect(redirectUrl);
    }

    if (!user) {
      // User is not authenticated, redirect to login page
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // User is authenticated, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    logAuthError('authMiddleware', error, request);
    
    // Redirect to login on error
    const redirectUrl = new URL('/login?error=auth_check_failed', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}
