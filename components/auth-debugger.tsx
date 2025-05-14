'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/utils/supabase/unified';
import { clientGuestUtils } from '@/utils/guest';

/**
 * AuthDebugger - Client-side component to help debug authentication issues
 *
 * This component displays an overlay with detailed auth state information
 * and logs auth state changes to help diagnose authentication detection issues.
 *
 * Only rendered in development environment.
 */
export default function AuthDebugger() {
  const [authState, setAuthState] = useState({
    loading: true,
    session: null as any,
    error: null as any,
    cookies: '',
    guestToken: null as string | null,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase.auth.getSession();

        // Get guest token from localStorage
        const guestToken = clientGuestUtils.getToken();

        setAuthState({
          loading: false,
          session: data.session,
          error,
          cookies: document.cookie,
          guestToken,
        });
      } catch (e) {
        setAuthState({
          loading: false,
          session: null,
          error: e,
          cookies: document.cookie,
          guestToken: clientGuestUtils.getToken(),
        });
      }
    }

    checkAuth();

    // Add listener for auth state changes
    const supabase = getBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(`[Client] Auth state change: ${event}`);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        session,
        cookies: document.cookie,
        guestToken: clientGuestUtils.getToken(),
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Count cookies by type
  const cookieCount = authState.cookies.split(';').length;
  const authCookies = authState.cookies.split(';').filter((c) => c.trim().startsWith('sb-')).length;
  const guestCookies = authState.cookies
    .split(';')
    .filter((c) => c.trim().startsWith('guest_token')).length;

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-black/80 text-white rounded-lg z-50 max-w-md text-xs">
      <h3 className="font-bold text-sm mb-2">Auth Debugger</h3>
      <div>
        <div>
          Status:{' '}
          {authState.loading
            ? 'Loading...'
            : authState.session
              ? 'Authenticated'
              : authState.guestToken
                ? 'Guest User'
                : 'Not authenticated'}
        </div>
        <div>User: {authState.session?.user?.email || 'None'}</div>
        {authState.guestToken && (
          <div className="text-green-400">
            Guest Token: {authState.guestToken.substring(0, 8)}...
          </div>
        )}
        <div>
          Cookies: {cookieCount} total, {authCookies} Supabase, {guestCookies} Guest
        </div>
        <div>
          Session expires:{' '}
          {authState.session?.expires_at
            ? new Date(authState.session.expires_at * 1000).toLocaleTimeString()
            : 'N/A'}
        </div>
        {authState.error && (
          <div className="text-red-400 mt-2">Error: {authState.error.message}</div>
        )}
      </div>
    </div>
  );
}
