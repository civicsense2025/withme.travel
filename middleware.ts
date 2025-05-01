import { NextRequest, NextResponse } from 'next/server';
// Removed Database import as it might not be needed directly in middleware
// Use the CORRECT client creation function specifically for middleware
import { getMiddlewareClient } from '@/utils/supabase/unified';
import { PAGE_ROUTES } from '@/utils/constants/routes';
import { TypedSupabaseClient } from '@/utils/supabase/unified'; // Import the client type

// Helper function to check admin status using the Supabase client instance
async function isAdmin(
  supabaseClient: TypedSupabaseClient
): Promise<{ isAdmin: boolean; userId: string | null }> {
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    // Avoid logging expected "No session" or "AuthSessionMissingError"
    if (
      userError &&
      userError.message !== 'No session found' &&
      !userError.message.includes('AuthSessionMissingError')
    ) {
      console.error('[Middleware Admin Check] Auth Error:', userError.message);
    }
    return { isAdmin: false, userId: null };
  }

  console.log('[Middleware] Admin check for user:', user.id);

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // Avoid logging expected row-not-found errors
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[Middleware Admin Check] Profile Error:', profileError.message);
    }
    const knownProfile = profile as { is_admin: boolean | null } | null;
    return { isAdmin: knownProfile?.is_admin ?? false, userId: user.id };
  }

  return { isAdmin: profile.is_admin === true, userId: user.id };
}

// Removed getUserRole as it duplicated isAdmin logic and wasn't used directly below

// Function to add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  const cspHeader = [
    // Recommended stricter CSP - adjust based on specific needs
    "default-src 'self'",
    // Allow scripts from self, Supabase CDN, Vercel, Stripe, Google (Maps, GTM, Analytics), jsdelivr
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.vercel-scripts.com https://js.stripe.com https://maps.googleapis.com https://*.google.com https://accounts.google.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net", // Added https://js.stripe.com
    "worker-src 'self' blob:",
    // Allow styles from self, inline (often needed for UI libs), Google Fonts, Vercel
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.app",
    // Allow images from self, data URIs, common CDNs, blobs, Google Maps/User Content
    "img-src 'self' data: https://*.unsplash.com https://*.pexels.com https://images.unsplash.com https://res.cloudinary.com blob: https://maps.gstatic.com https://maps.googleapis.com https://*.ggpht.com https://*.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Allow connections to self, Supabase, Vercel, Google APIs, Stripe, Supabase websockets
    "connect-src 'self' https://*.supabase.co https://*.vercel-scripts.com https://vitals.vercel-insights.com https://maps.googleapis.com https://www.google-analytics.com https://*.google.com https://api.stripe.com wss://*.supabase.io",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    // Allow form actions to self and Stripe checkout
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const DEBUG = process.env.NODE_ENV === 'development';
  const { pathname } = request.nextUrl;

  // --- Early Exit for Static Assets ---
  const isStaticAsset =
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i) !== null ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    pathname === '/favicon.ico'; // Explicitly match favicon

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // --- Supabase Client Initialization & Session Refresh ---
  console.log(`[Middleware] Processing request for: ${pathname}`);

  // Get the auth cookies for debugging
  const authCookies = request.cookies
    .getAll()
    .filter((c) => c.name.startsWith('sb-'))
    .map((c) => `${c.name}=${c.value.substring(0, 10)}...`)
    .join('; ');

  console.log(`[Middleware] Auth cookies: ${authCookies || 'none'}`);

  // Pass only the request; getMiddlewareClient creates the response
  const { supabase, response } = getMiddlewareClient(request);

  // Try to get the user without refreshing first, to avoid refresh on all requests
  let userIsLoggedIn = false;

  try {
    // First try to get the user without refreshing
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // If we have a valid user, we're authenticated
    if (!userError && userData?.user?.id) {
      userIsLoggedIn = true;
      console.log(`[Middleware] Authenticated user found without refresh: ${userData.user.id}`);
    }
    // Otherwise, try refreshing the session
    else {
      console.log('[Middleware] No valid user found, attempting session refresh');
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        if (
          DEBUG &&
          refreshError.message !== 'No session found' &&
          !refreshError.message.includes('AuthSessionMissingError')
        ) {
          console.error('[Middleware] Error refreshing session:', refreshError.message);
        }
      } else if (session?.user?.id) {
        userIsLoggedIn = true;
        console.log(`[Middleware] Session refreshed successfully for user: ${session.user.id}`);
      }
    }
  } catch (error) {
    console.error('[Middleware] Error during auth check:', error);
  }

  // --- Route Protection Logic ---
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/offline',
    '/auth/',
    '/api/auth/',
    '/api/destinations',
    '/api/places',
    '/api/images',
    '/api/mapbox',
    '/api/cron',
    '/api/sentry-example-api',
    '/sentry-example-page',
    '/destinations',
    '/itineraries/',
    '/trips/public/',
    // Add any other explicitly public paths or API endpoints
  ];

  // Check if the path starts with any of the public paths
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check for public API routes that aren't covered by prefix match
  const isPublicApiRoute =
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/admin/') &&
    !pathname.startsWith('/api/user/') &&
    !pathname.startsWith('/api/trips/') && // Most trip APIs require auth
    !pathname.startsWith('/api/itineraries/') && // Template use needs auth
    !pathname.startsWith('/api/invitations/') &&
    !pathname.startsWith('/api/likes/') &&
    !pathname.startsWith('/api/notifications/') &&
    !publicPaths.some((p) => pathname.startsWith(p)); // Avoid double-checking prefixes

  const requiresAuth = !(isPublicPath || isPublicApiRoute);

  // Redirect unauthenticated users from protected routes - but use a more careful approach
  // to prevent unwanted redirects during Next.js data fetching or RSC operations
  if (requiresAuth && !userIsLoggedIn) {
    // Exclude Next.js internal navigation requests which have a special header
    // These are RSC fetches or other internal requests
    const isInternalNextRequest =
      request.headers.get('next-router-prefetch') ||
      request.headers.get('next-url') ||
      request.headers.get('x-middleware-prefetch') ||
      request.headers.get('purpose') === 'prefetch';

    // Don't redirect API routes - just return 401
    const isApiRoute = pathname.startsWith('/api/');

    if (isApiRoute) {
      console.log(`[Middleware] Unauthorized API access to ${pathname}, returning 401`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only redirect for actual page navigations, not internal Next.js requests
    if (!isInternalNextRequest) {
      console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to login.`);
      const redirectUrl = new URL(PAGE_ROUTES.LOGIN, request.url);
      // Store the originally requested URL so we can redirect back after login
      redirectUrl.searchParams.set('redirectTo', pathname);
      // Use NextResponse.redirect which creates the correct response object
      return NextResponse.redirect(redirectUrl);
    }
  }

  // --- Admin Route Protection ---
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const { isAdmin: userIsAdmin } = await isAdmin(supabase); // Pass the client
    if (!userIsAdmin) {
      console.warn(`[Middleware] Non-admin access attempt to admin route: ${pathname}`);
      const redirectUrl = userIsLoggedIn ? PAGE_ROUTES.TRIPS : PAGE_ROUTES.LOGIN;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    if (DEBUG) console.log(`[Middleware] Admin access granted for: ${pathname}`);
  }

  // --- Header Modifications ---
  // Add auth state debug header with more details
  response.headers.set('X-Auth-State', userIsLoggedIn ? 'authenticated' : 'unauthenticated');

  // Note: We can no longer set user ID in header since we refactored the code
  // and userData may not be accessible here anymore

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    // Be more specific with origin in production
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, apikey, x-client-info, x-supabase-auth'
    );
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle OPTIONS preflight requests separately
    if (request.method === 'OPTIONS') {
      // Return a simple 204 No Content response for OPTIONS
      return new Response(null, { status: 204, headers: response.headers });
    }
  }

  // Add cache-busting headers for auth-related pages/APIs
  if (pathname.includes('/auth') || pathname.includes('/login') || pathname.includes('/api/auth')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Apply security headers LAST to the final response object
  const finalResponse = addSecurityHeaders(response);

  // --- Return the final response ---
  return finalResponse;
}

// Middleware Matcher Configuration (ensure this covers all necessary paths)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - icons/ (public icons)
     * - design-sandbox/ (public assets)
     * - robots.txt, sitemap.xml, manifest.json (common web assets)
     * Review this list to ensure it doesn't exclude necessary paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/|design-sandbox|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};
