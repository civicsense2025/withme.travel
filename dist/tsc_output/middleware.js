import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
// Helper function to check admin status
async function isAdmin(request, supabaseClient) {
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
        console.error('[Middleware Admin Check] Error fetching profile or profile not found:', error === null || error === void 0 ? void 0 : error.message);
        return false;
    }
    return profile.is_admin === true;
}
export async function middleware(request) {
    var _a;
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });
    // Create supabase client using @supabase/ssr for middleware
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get(name) {
                var _a;
                return (_a = request.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            set(name, value, options) {
                // If the cookie is set, update the request and response cookies
                request.cookies.set(Object.assign({ name,
                    value }, options));
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                response.cookies.set(Object.assign({ name,
                    value }, options));
            },
            remove(name, options) {
                // If the cookie is removed, update the request and response cookies
                request.cookies.set(Object.assign({ name, value: '' }, options));
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                response.cookies.set(Object.assign({ name, value: '' }, options));
            },
        },
    });
    // IMPORTANT: Refresh session - this will update the cookies if needed.
    // Use getUser() instead of getSession() for authentication check.
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error('[Middleware] Error getting user:', userError.message);
        // Decide if you want to clear cookies here or just let the request proceed
        // Clearing might log the user out unexpectedly on transient errors.
    }
    console.log('[Middleware] User found:', (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : 'None');
    // Protected routes definition
    const protectedRoutes = [
        '/trips',
        '/settings',
        '/saved',
        '/admin'
    ];
    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    // If accessing a protected route and no user is found, redirect to login
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url);
        const originalPath = pathname + request.nextUrl.search;
        redirectUrl.searchParams.set('redirect', originalPath);
        console.log('[Middleware] Redirecting to login for protected route:', redirectUrl.toString());
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
