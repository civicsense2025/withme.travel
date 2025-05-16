'use client';

import { useEffect, useState } from 'react';
import clientGuestUtils from '@/utils/guest';
import { getBrowserClient } from '@/utils/supabase/unified';

/**
 * UserTestingDebugger - Client-side component to help debug user testing authentication
 *
 * This component displays an overlay with detailed auth state information
 * focused on user testing flows, including guest tokens and survey data.
 *
 * Only rendered in development environment.
 */
export function UserTestingDebugger() {
  const [state, setState] = useState({
    loading: true,
    authSession: null as any,
    error: null as any,
    guestToken: null as string | null,
    userTestingData: null as any,
    cookies: '',
  });

  useEffect(() => {
    async function checkState() {
      try {
        // Check Supabase auth
        const supabase = getBrowserClient();
        const { data, error } = await supabase.auth.getSession();

        // Get guest token from localStorage
        const guestToken = clientGuestUtils.getToken();
        
        // Get user testing data from localStorage directly
        const userTestingDataStr = localStorage.getItem('userTestingData');
        const userTestingData = userTestingDataStr ? JSON.parse(userTestingDataStr) : null;

        setState({
          loading: false,
          authSession: data.session,
          error,
          guestToken,
          userTestingData,
          cookies: document.cookie,
        });
      } catch (e) {
        setState({
          loading: false,
          authSession: null,
          error: e,
          guestToken: clientGuestUtils.getToken(),
          userTestingData: null,
          cookies: document.cookie,
        });
      }
    }

    checkState();

    // Add listener for auth state changes
    const supabase = getBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      checkState();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Count cookies by type
  const cookieCount = state.cookies.split(';').length;
  const authCookies = state.cookies.split(';').filter((c) => c.trim().startsWith('sb-')).length;
  const guestCookies = state.cookies
    .split(';')
    .filter((c) => c.trim().startsWith('guest_token')).length;

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-black/80 text-white rounded-lg z-50 max-w-md text-xs font-mono">
      <h3 className="font-bold text-sm mb-2">User Testing Debugger</h3>
      <div className="space-y-1">
        <div>
          Status:{' '}
          {state.loading
            ? 'Loading...'
            : state.authSession
              ? 'Authenticated'
              : state.guestToken
                ? 'Guest User'
                : 'Not authenticated'}
        </div>
        
        {state.authSession && (
          <div>User: {state.authSession?.user?.email || 'None'}</div>
        )}
        
        {state.guestToken && (
          <div className="text-green-400">
            Guest Token: {state.guestToken.substring(0, 8)}...
          </div>
        )}
        
        {state.userTestingData && (
          <div className="text-blue-400">
            User Testing: {state.userTestingData.name} ({state.userTestingData.email})
          </div>
        )}
        
        <div>
          Cookies: {cookieCount} total, {authCookies} Supabase, {guestCookies} Guest
        </div>
        
        <div>
          Session expires:{' '}
          {state.authSession?.expires_at
            ? new Date(state.authSession.expires_at * 1000).toLocaleTimeString()
            : 'N/A'}
        </div>
        
        {state.error && (
          <div className="text-red-400 mt-2">Error: {state.error.message}</div>
        )}
      </div>
    </div>
  );
} 