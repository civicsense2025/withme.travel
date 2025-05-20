import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { rateLimit, RateLimitOptions } from '@/utils/middleware/rate-limit';
import { GROUP_VISIBILITY } from '@/utils/constants/status';
import { getTypedDbClient } from '@/utils/supabase/server';
import type { Database as DatabaseTypes } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, USER_TABLES, TableName, GROUP_TABLES} from './utils/constants/tables';

// Define public paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/auth/signin',
  '/auth',
  '/privacy',
  '/terms',
  '/support',
  '/',
  '/destinations',
  '/countries',
  '/continents',
  '/search',
  '/groups',
  '/trips',
  // Add other public paths as needed
];

// Protected paths that always require authentication
const protectedPaths = [
  '/groups/*/plans/*',
  '/admin', // Make admin an explicitly protected path
  // Add other protected paths as needed
];

// Debug endpoints
const debugPaths = ['/debug', '/api/debug'];

// Public API paths
const publicApiPaths = [
  '/api/auth/status',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/clear-cookies',
  '/api/auth/me',
  '/api/auth/callback',
  '/api/trips',
  '/api/trips/public',
  '/api/itineraries',
  '/api/destinations',
  '/api/search',
  '/api/mapbox',
  '/api/images',
  '/api/groups',
  '/api/groups/*/plans/*', // Add API route for group plans
  // Add other public API paths as needed
];

/**
 * Check if a path is protected and always requires authentication
 */
function isProtectedPath(path: string): boolean {
  // First normalize the path to handle both exact matches and path patterns
  const normalizedPath = path.split('?')[0]; // Remove query parameters

  // Check exact paths first
  if (protectedPaths.some((protectedPath) => normalizedPath.startsWith(protectedPath))) {
    return true;
  }

  return false;
}

/**
 * Check if a path is public and doesn't require authentication
 */
function isPublicPath(path: string): boolean {
  // First normalize the path to handle both exact matches and path patterns
  const normalizedPath = path.split('?')[0]; // Remove query parameters

  // Check if path is explicitly protected first
  if (isProtectedPath(normalizedPath)) {
    return false;
  }

  // Explicitly handle admin paths
  if (normalizedPath.startsWith('/admin')) {
    return false; // Admin paths are never public
  }

  // Check exact paths first
  if (publicPaths.includes(normalizedPath)) {
    return true;
  }

  // Group preview paths should always be public
  if (normalizedPath.includes('/ideas-preview')) {
    console.log(`[Middleware] Public path access (ideas-preview): ${normalizedPath}`);
    return true;
  }

  // Then check startsWith patterns
  return (
    publicPaths.some((publicPath) => normalizedPath.startsWith(publicPath)) ||
    publicApiPaths.some((publicApiPath) => normalizedPath.startsWith(publicApiPath)) ||
    debugPaths.some((debugPath) => normalizedPath.startsWith(debugPath)) ||
    // Auth callback needs special attention
    normalizedPath.startsWith('/auth/callback') ||
    normalizedPath.startsWith('/api/auth/') ||
    // Static assets and favicon
    normalizedPath.startsWith('/_next') ||
    normalizedPath.startsWith('/static') ||
    normalizedPath.startsWith('/images') ||
    normalizedPath.startsWith('/icons') ||
    normalizedPath.startsWith('/favicon')
  );
}

/**
 * Check if a path is for a specific group
 */
function isGroupPath(path: string): boolean {
  // Match /groups/{id} and any subpaths
  return /^\/groups\/[a-zA-Z0-9-]+/.test(path);
}

/**
 * Next.js middleware function
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getSession();

  // Check auth status
  const { data: { user } } = await supabase.auth.getUser();

  // Auth protection logic
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent authenticated users from accessing login
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Define middleware matching paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
