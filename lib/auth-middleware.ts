import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';
import { errorResponse } from './api-utils';

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service key might be needed depending on the middleware logic

if (!supabaseUrl || !serviceKey) {
  // Check for serviceKey too if needed
  console.error('[lib/auth-middleware] Supabase URL or Service Key is missing.');
}

// Create a single instance of the Supabase admin client for this module
// Adjust if serviceKey is not needed or if a different client type is required
const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient<Database>(supabaseUrl, serviceKey) : null;

/**
 * Authentication result interface
 */
export interface AuthResult {
  authorized: boolean;
  user?: any;
  error?: string;
  response?: NextResponse;
}

/**
 * Middleware to require authentication
 * Returns user data if authenticated or error response if not
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        error: error?.message || 'Unauthorized',
        response: errorResponse('Unauthorized', 401),
      };
    }

    return { authorized: true, user };
  } catch (error) {
    console.error('Auth middleware error:', error);
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
export async function requireAdmin(): Promise<AuthResult> {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authResult.user.id)
      .single();

    if (error || !profile || !profile.is_admin) {
      return {
        authorized: false,
        error: 'Admin access required',
        response: errorResponse('Admin access required', 403),
      };
    }

    return { authorized: true, user: authResult.user };
  } catch (error) {
    console.error('Admin auth middleware error:', error);
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
export async function withAuth<T>(handler: (user: any) => Promise<T>): Promise<T | NextResponse> {
  const result = await requireAuth();
  if (!result.authorized) {
    return result.response as NextResponse;
  }
  return handler(result.user);
}

/**
 * Helper to handle admin auth within route handlers
 * @param handler - The function to run if an admin
 */
export async function withAdmin<T>(handler: (user: any) => Promise<T>): Promise<T | NextResponse> {
  const result = await requireAdmin();
  if (!result.authorized) {
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
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Middleware function to protect routes
export async function authMiddleware(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error('[authMiddleware] Supabase client not initialized.');
      const redirectUrl = new URL('/login?error=auth_setup_failed', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser();

    if (!user) {
      // User is not authenticated, redirect to login page
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // User is authenticated, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Redirect to login on error
    const redirectUrl = new URL('/login?error=auth_check_failed', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}
