import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { rateLimit, RateLimitOptions } from '@/utils/middleware/rate-limit';

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
  // Add other public paths as needed
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
  '/api/trips/public',
  '/api/itineraries',
  '/api/destinations',
  '/api/search',
  '/api/mapbox',
  '/api/images',
  // Add other public API paths as needed
];

/**
 * Check if a path is public and doesn't require authentication
 */
function isPublicPath(path: string): boolean {
  // First normalize the path to handle both exact matches and path patterns
  const normalizedPath = path.split('?')[0]; // Remove query parameters

  // Check exact paths first
  if (publicPaths.includes(normalizedPath)) {
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
 * Next.js middleware function
 */
export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
      // Set up the rate limit options
      const rateLimitOptions: RateLimitOptions = {
        limit: 60, // 60 requests
        windowMs: 60 * 1000, // per minute
      };

      // Create and apply the rate limiter
      const rateLimiter = rateLimit(rateLimitOptions);
      const rateLimitResult = await rateLimiter(req);

      // If rate limit is exceeded, rateLimiter returns a Response
      if (rateLimitResult) {
        return rateLimitResult;
      }
    }

    // Skip auth checks for public paths
    if (isPublicPath(pathname)) {
      console.log(`[Middleware] Public path access: ${pathname}`);
      return NextResponse.next();
    }

    // Create supabase middleware client for auth check
    const res = NextResponse.next();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return req.cookies.get(name)?.value;
          },
          set(name, value, options) {
            res.cookies.set({ name, value, ...options });
          },
          remove(name, options) {
            res.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If there's no session, redirect to login
    if (!session) {
      const redirectUrl = new URL('/login', req.url);

      // Add the original URL as a redirect parameter
      redirectUrl.searchParams.set('redirectTo', encodeURIComponent(pathname));

      // Log the redirect for debugging
      console.log(`[Middleware] Redirecting unauthenticated request from ${pathname} to login`);

      return NextResponse.redirect(redirectUrl);
    }

    // User is authenticated, proceed with the request
    console.log(`[Middleware] Authenticated access: ${pathname} (user: ${session.user.id})`);
    return res;
  } catch (error) {
    // Log the error
    console.error('[Middleware] Error:', error);

    // Continue with the request in case of error
    return NextResponse.next();
  }
}

// Define middleware matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, public paths, and api health check
     * We'll handle the specific exclusions inside the middleware function
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
