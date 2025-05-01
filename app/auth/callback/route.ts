import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities
 */
function validateRedirectUrl(url: string): boolean {
  // Allow relative URLs starting with /
  if (url.startsWith('/')) {
    return true;
  }

  try {
    // For absolute URLs, ensure they point to our domain
    const urlObj = new URL(url);
    const allowedHosts = [
      'localhost',
      'withme.travel',
      'www.withme.travel',
      'staging.withme.travel',
      'prod.withme.travel',
      '127.0.0.1',
    ];

    // Check if the hostname is in our allow list
    return allowedHosts.some(
      (host) => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
    );
  } catch {
    // Invalid URL format
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Auth Callback] Processing auth callback');

    // Get the auth 'code' from the query string
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    // Check if we got a code, if not redirect with error
    if (!code) {
      console.error('[Auth Callback] Missing code parameter');

      // Redirect to login page with error
      const redirectTo = new URL('/login', requestUrl.origin);
      redirectTo.searchParams.set('error', 'missing_code');
      return NextResponse.redirect(redirectTo.toString());
    }

    // Check for redirect parameter
    let redirectPath = requestUrl.searchParams.get('redirect') || '/';

    // For security, validate that the redirect is to our own domain or is a relative path
    // and not to an external site
    try {
      // Check if it's a URL or a path
      if (redirectPath.includes('://')) {
        const redirectUrl = new URL(redirectPath);
        // Only allow redirects to our domain
        if (redirectUrl.host !== requestUrl.host) {
          console.warn(`[Auth Callback] Rejecting redirect to external host: ${redirectUrl.host}`);
          // Reject external redirects by using default path
          redirectPath = '/';
        }
      }
    } catch (e) {
      // If URL parsing fails, assume it's a relative path
      console.warn(`[Auth Callback] Error validating redirect URL: ${e}`);
    }

    console.log(`[Auth Callback] Supabase auth code present, processing auth exchange`);
    console.log(`[Auth Callback] Redirect path after auth: ${redirectPath}`);

    // Create the Supabase client using the server client helper
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name) => {
            const cookie = await cookieStore.get(name);
            return cookie?.value;
          },
          set: async (name, value, options) => {
            await cookieStore.set({ name, value, ...options });
          },
          remove: async (name, options) => {
            await cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Exchange the code for a session and store it in cookies
    // This will automatically handle setting the auth cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error);

      // Redirect to login page with error
      const redirectTo = new URL('/login', requestUrl.origin);
      redirectTo.searchParams.set('error', error.message);
      return NextResponse.redirect(redirectTo.toString());
    }

    // Set additional headers to prevent caching of this response
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Successful auth, redirect to the intended destination or home page
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin), {
      headers,
    });
  } catch (err) {
    console.error('[Auth Callback] Unexpected error in auth callback:', err);

    // On error, redirect to login page with generic error
    const returnUrl = new URL('/login', request.url);
    returnUrl.searchParams.set('error', 'auth_callback_error');

    return NextResponse.redirect(returnUrl.toString());
  }
}
