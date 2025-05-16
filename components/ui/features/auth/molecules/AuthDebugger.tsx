'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/utils/supabase/unified';

/**
 * AuthDebugger - Client-side component to help debug authentication issues
 *
 * This component displays an overlay with detailed auth state information
 * and logs auth state changes to help diagnose authentication detection issues.
 *
 * Only rendered in development environment.
 */
export function AuthDebugger() {
  const [authState, setAuthState] = useState({
    loading: true,
    session: null as any,
    error: null as any,
    cookies: '',
    authToken: null as string | null,
  });

  useEffect(() => {
    try {
      console.log('AuthDebugger: checking auth state');
      
      // Check localStorage for auth token
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('AuthDebugger: localStorage authToken:', authToken ? 'present' : 'not present');
      
      async function checkAuth() {
        try {
          // Get Supabase session directly
          const supabase = getBrowserClient();
          const { data: { session }, error } = await supabase.auth.getSession();
          
          // Document cookie string (don't log in production)
          const cookies = process.env.NODE_ENV === 'development' ? document.cookie : '[hidden in production]';
          
          // Update auth state
          setAuthState({
            loading: false,
            session,
            error,
            cookies,
            authToken
          });
        } catch (err) {
          console.error('AuthDebugger: Error checking auth:', err);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: err,
            authToken
          }));
        }
      }
      
      checkAuth();
    } catch (error) {
      console.error('AuthDebugger: Error in auth check:', error);
      // Set a safe error state without crashing
      setAuthState({
        loading: false,
        session: null,
        error,
        cookies: '',
        authToken: null
      });
    }
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't render in production
  }

  // Render auth state information
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      <h4 style={{ margin: '0 0 5px 0' }}>Auth Debug</h4>
      {authState.loading ? (
        <p>Loading auth state...</p>
      ) : (
        <div>
          <p>
            <strong>Auth Status:</strong>{' '}
            {authState.session ? 'Logged in' : 'Not logged in'}
          </p>
          {authState.session && (
            <p>
              <strong>User:</strong> {authState.session.user?.email}
            </p>
          )}
          {authState.authToken && (
            <p>
              <strong>Auth Token:</strong> {authState.authToken.substring(0, 8)}...
            </p>
          )}
          {authState.error && (
            <p style={{ color: 'red' }}>
              <strong>Error:</strong> {authState.error.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 