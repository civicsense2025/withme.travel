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

// Helper function to get user role
async function getUserRole(request: NextRequest, supabaseClient: ReturnType<typeof createServerClient>): Promise<{
  userId: string | null;
  isAdmin: boolean;
}> {
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return { userId: null, isAdmin: false };
    }
    
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.error('[Middleware Role Check] Error fetching profile:', profileError?.message);
      return { userId: user.id, isAdmin: false };
    }
    
    return { 
      userId: user.id,
      isAdmin: profile.is_admin === true
    };
  } catch (error) {
    console.error('[Middleware Role Check] Unexpected error:', error);
    return { userId: null, isAdmin: false };
  }
}

// Function to add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://accounts.google.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://va.vercel-scripts.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://*.unsplash.com https://*.pexels.com https://images.unsplash.com https://res.cloudinary.com blob: https://maps.googleapis.com https://lh3.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://js.stripe.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://www.google-analytics.com https://va.vercel-scripts.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Add other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), interest-cohort=()');
  
  // Only set HSTS header in production to avoid issues during development
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  return response;
}

// Function to add CORS headers to response
function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Define allowed origins
  const allowedOrigins = [
    'https://withme.travel',
    'https://www.withme.travel',
    'https://staging.withme.travel'
  ];
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://127.0.0.1:3000');
  }
  
  // Get the origin from the request
  const origin = request.headers.get('origin');
  
  // If the origin is in our allowed list, set the CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  } else {
    // For security, if origin is not allowed, set a restrictive CORS policy
    response.headers.set('Access-Control-Allow-Origin', 'null');
  }
  
  return response;
}

// Handle CORS preflight requests
function handleCorsPreflightRequest(request: NextRequest): NextResponse | null {
  // Check if this is a CORS preflight request (OPTIONS method with Origin and Access-Control-Request-Method headers)
  if (
    request.method === 'OPTIONS' &&
    request.headers.get('origin') &&
    request.headers.get('access-control-request-method')
  ) {
    // Create a minimal response for the preflight request
    const response = new NextResponse(null, { status: 204 }); // No content
    
    // Add CORS headers to the response
    return addCorsHeaders(request, response);
  }
  
  // Not a preflight request
  return null;
}

// Define role requirements for protected routes
interface ProtectedRouteConfig {
  path: string;
  requiresAuth: boolean;
  requiredRoles?: {
    isAdmin?: boolean;
  };
  exceptions?: string[]; // Paths that start with this route but should be exceptions
}

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests first
  const preflightResponse = handleCorsPreflightRequest(request);
  if (preflightResponse) {
    return preflightResponse;
  }
  
  // Bypass auth for Flight/RSC requests
  const acceptHeader = request.headers.get('accept') || '';
  if (acceptHeader.includes('text/x-component')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  // Add CORS headers to the response
  response = addCorsHeaders(request, response);

  // Protected routes definition with role requirements
  const protectedRoutes: ProtectedRouteConfig[] = [
    { 
      path: '/dashboard', 
      requiresAuth: true 
    },
    { 
      path: '/trips', 
      requiresAuth: true,
      exceptions: ['/trips/public'] 
    },
    { 
      path: '/settings', 
      requiresAuth: true 
    },
    { 
      path: '/saved', 
      requiresAuth: true 
    },
    { 
      path: '/admin', 
      requiresAuth: true,
      requiredRoles: { isAdmin: true } 
    }
  ];
  
  const pathname = request.nextUrl.pathname;
  
  // Find matching route config
  const matchingRoute = protectedRoutes.find(route => {
    // Check if the path starts with the route path
    const matches = pathname.startsWith(route.path);
    
    // If there are exceptions, make sure it doesn't match any of them
    if (matches && route.exceptions) {
      return !route.exceptions.some(exception => pathname.startsWith(exception));
    }
    
    return matches;
  });
  
  // If it's not a protected route, allow the request through
  if (!matchingRoute) {
    return addSecurityHeaders(addCorsHeaders(request, response));
  }

  // Create supabase client using @supabase/ssr for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Make get async to await request.cookies
        async get(name: string) {
          const cookieStore = await request.cookies; // Await cookies here
          return cookieStore.get(name)?.value
        },
        // Make set async to await request.cookies
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await request.cookies; // Await cookies here
          try {
            cookieStore.set({ name, value, ...options })
            // Also update the response cookies
            response.cookies.set({
              name,
              value,
              ...options,
            })
          } catch (error) {
            // Log error if needed
          }
        },
        // Make remove async to await request.cookies
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await request.cookies; // Await cookies here
          try {
            cookieStore.set({ name, value: '', ...options })
            // Also update the response cookies
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          } catch (error) {
            // Log error if needed
          }
        },
      },
    }
  )

  // IMPORTANT: Refresh session first, then get the user.
  try {
    // Call getSession() to handle session refresh and update response cookies
    await supabase.auth.getSession(); 

    // Get user role
    const { userId, isAdmin } = await getUserRole(request, supabase);

    // If authenticated user is required but no user was found
    if (matchingRoute.requiresAuth && !userId) {
      // Add a check for development mode to bypass auth for testing if needed
      if (process.env.NODE_ENV === 'development' && request.headers.get('x-bypass-auth') === 'true') {
        console.log('[Middleware] Development mode: bypassing auth check');
        return addSecurityHeaders(addCorsHeaders(request, response));
      }

      // Create the redirect URL with the original path for redirect after login
      const redirectUrl = new URL('/login', request.url);
      const originalPath = pathname + (request.nextUrl.search || '');
      redirectUrl.searchParams.set('redirect', originalPath);
      
      console.log('[Middleware] Redirecting to login for protected route:', redirectUrl.toString());
      console.log('[Middleware] Original path for redirect:', originalPath);
      
      return addSecurityHeaders(addCorsHeaders(request, NextResponse.redirect(redirectUrl)));
    }

    // Check role requirements if they exist
    if (matchingRoute.requiredRoles) {
      // Check admin role if required
      if (matchingRoute.requiredRoles.isAdmin && !isAdmin) {
        console.log(`[Middleware] Non-admin user (${userId}) attempting to access ${pathname}. Redirecting.`);
        return addSecurityHeaders(addCorsHeaders(request, NextResponse.redirect(new URL('/', request.url))));
      }
    }

    // All checks passed, allow the request to proceed
    console.log(`[Middleware] Access granted for user ${userId || 'unknown'} to ${pathname}`);
    return addSecurityHeaders(addCorsHeaders(request, response));
  } catch (error) {
    console.error('[Middleware] Error in middleware:', error);
    return addSecurityHeaders(addCorsHeaders(request, response));
  }
}

export const config = {
  matcher: [
    // Match all routes to add security headers
    '/(.*)',
    // Exclude static files and API routes from authentication checks
    // But still apply security headers to all routes
  ],
}; 