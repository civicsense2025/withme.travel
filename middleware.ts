import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// Helper function to check admin status
async function isAdmin(request: NextRequest, supabaseClient: ReturnType<typeof createServerClient>): Promise<boolean> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    return false;
  }

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error('[Middleware Admin Check] Error fetching profile or profile not found:', error?.message);
    return false;
  }

  return profile.is_admin === true;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Protected routes definition
  const protectedRoutes = [
    '/dashboard',
    '/trips',
    '/settings',
    '/saved',
    '/admin'
  ];
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Create supabase client using @supabase/ssr for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieStore = request.cookies;
          const cookies = cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }));
          return cookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  // IMPORTANT: Refresh session - this will update the cookies if needed.
  // Use getUser() instead of getSession() for authentication check.
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('[Middleware] Error getting user:', userError.message);
      // Instead of immediately treating this as an error, check localStorage on the client side
      // This is a workaround for session inconsistency issues
    }

    console.log('[Middleware] User found:', user?.id ?? 'None');
    console.log('[Middleware] Path:', pathname);
    console.log('[Middleware] Is protected route:', isProtectedRoute);

    // If accessing a protected route and no user is found, redirect to login
    if (isProtectedRoute && !user) {
      // Add a check for development mode to bypass auth for testing if needed
      if (process.env.NODE_ENV === 'development' && request.headers.get('x-bypass-auth') === 'true') {
        console.log('[Middleware] Development mode: bypassing auth check');
        return response;
      }

      // Create the redirect URL, ensuring proper path formatting
      const redirectUrl = new URL('/login', request.url);
      const originalPath = pathname + (request.nextUrl.search || '');
      
      // Use the encodeURIComponent to ensure correct URL encoding
      redirectUrl.searchParams.set('redirect', originalPath);
      
      console.log('[Middleware] Redirecting to login for protected route:', redirectUrl.toString());
      console.log('[Middleware] Original path for redirect:', originalPath);
      
      return NextResponse.redirect(redirectUrl);
    }

    // Special handling for admin routes
    if (pathname.startsWith('/admin')) {
      if (user) { // Only check admin status if user exists
          const userIsAdmin = await isAdmin(request, supabase); // Pass the created client
          if (!userIsAdmin) {
              console.log(`[Middleware] Non-admin user (${user.id}) attempting to access /admin. Redirecting.`);
              return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins away
          }
           console.log(`[Middleware] Admin user (${user.id}) accessing /admin.`);
      } 
      // If no user, the redirect above already handled it
    }

    // All checks passed, allow the request to proceed with the updated response (containing potentially refreshed cookies)
    return response;
  } catch (error) {
    console.error('[Middleware] Error in middleware:', error);
    return response;
  }
}

export const config = {
  matcher: [
    // Match protected routes and potentially API routes if needed
    '/trips/:path*',
    '/settings/:path*',
    '/saved/:path*',
    // '/itineraries/:path*', // Consider if itineraries always require login
    '/admin/:path*',
    // Add other paths that need session refreshing or protection
    
    // Avoid matching static files and _next internal routes:
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 