'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCheck() {
  const [authStatus, setAuthStatus] = useState<string>('checking');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [cookieInfo, setCookieInfo] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthStatus('checking');
        const supabase = createClient();

        if (!supabase) {
          setAuthStatus('error');
          setError('Failed to create Supabase client');
          return;
        }

        // Get current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setAuthStatus('error');
          setError(`Auth error: ${error.message}`);
          return;
        }

        if (data.session) {
          setAuthStatus('authenticated');
          setUser(data.session.user);
          // Get a substring of the access token to display
          const token = data.session.access_token;
          setSessionToken(token ? `${token.substring(0, 15)}...` : 'No token');
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        setAuthStatus('error');
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    // Check cookies
    const getCookies = () => {
      try {
        const cookies = document.cookie;
        if (cookies) {
          setCookieInfo(cookies);
        } else {
          setCookieInfo('No cookies found');
        }
      } catch (err) {
        setCookieInfo(`Error getting cookies: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    checkAuth();
    getCookies();
  }, []);

  const handleRefreshSession = async () => {
    try {
      const supabase = createClient();

      if (!supabase) {
        setError('Failed to create Supabase client');
        return;
      }

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        setError(`Session refresh error: ${error.message}`);
        return;
      }

      if (data.session) {
        setAuthStatus('authenticated');
        setUser(data.session.user);
        setSessionToken(data.session.access_token.substring(0, 15) + '...');
        setError(null);
      } else {
        setAuthStatus('unauthenticated');
      }
    } catch (err) {
      setError(`Refresh error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleRepairCookies = async () => {
    try {
      // Call your custom API endpoint to clear and repair cookies
      const response = await fetch('/api/auth/clear-cookies', { method: 'POST' });

      if (!response.ok) {
        const data = await response.json();
        setError(`Cookie repair failed: ${data.error || response.statusText}`);
        return;
      }

      setCookieInfo('Cookies cleared. Try to log in again.');
      setAuthStatus('cookies_cleared');
    } catch (err) {
      setError(`Cookie repair error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            Check your current authentication state and repair if needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Auth Status:</span>
              <span
                className={
                  authStatus === 'authenticated'
                    ? 'text-green-500'
                    : authStatus === 'error'
                      ? 'text-red-500'
                      : authStatus === 'checking'
                        ? 'text-yellow-500'
                        : 'text-gray-500'
                }
              >
                {authStatus}
              </span>
            </div>

            {user && (
              <div className="flex flex-col gap-2">
                <div className="font-semibold">User Info:</div>
                <div className="p-4 border rounded-md bg-gray-50 text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      id: user.id,
                      email: user.email,
                      role: user.role,
                    },
                    null,
                    2
                  )}
                </div>
              </div>
            )}

            {sessionToken && (
              <div className="flex flex-col gap-2">
                <div className="font-semibold">Session Token:</div>
                <div className="p-4 border rounded-md bg-gray-50 text-sm font-mono">
                  {sessionToken}
                </div>
              </div>
            )}

            {cookieInfo && (
              <div className="flex flex-col gap-2">
                <div className="font-semibold">Cookies:</div>
                <div className="p-4 border rounded-md bg-gray-50 text-sm font-mono break-all">
                  {cookieInfo}
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col gap-2">
                <div className="font-semibold">Error:</div>
                <div className="p-4 border rounded-md bg-red-50 text-red-600 text-sm">{error}</div>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <Button onClick={handleRefreshSession} disabled={authStatus === 'checking'}>
                Refresh Session
              </Button>

              <Button
                onClick={handleRepairCookies}
                variant="outline"
                disabled={authStatus === 'checking'}
              >
                Repair Auth Cookies
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
