'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Type for server auth status
interface ServerAuthStatus {
  timestamp: string;
  environment: string;
  auth_status: {
    has_session: boolean;
    session_error?: string;
    has_user: boolean;
    user_error?: string;
    user_id?: string;
    user_email?: string;
    auth_provider?: string;
    last_sign_in?: string;
  };
  user_data: any;
}

export default function AuthStatusDebugPage() {
  const { user, session, isLoading, error, supabase } = useAuth();
  const [serverAuth, setServerAuth] = useState<ServerAuthStatus | null>(null);
  const [isServerLoading, setIsServerLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [authCookies, setAuthCookies] = useState<string[]>([]);
  const [configIssues, setConfigIssues] = useState<
    { name: string; issue: string; severity: 'error' | 'warning' }[]
  >([]);

  // Fetch server auth status
  const fetchServerStatus = async () => {
    setIsServerLoading(true);
    setServerError(null);
    try {
      const response = await fetch('/api/debug/auth-status');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setServerAuth(data);

      // Check for mismatches
      analyzeAuthState(data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to fetch server auth status');
      console.error('Error fetching server auth status:', err);
    } finally {
      setIsServerLoading(false);
    }
  };

  // Analyze auth state for mismatches
  const analyzeAuthState = (serverData: any) => {
    const issues: { name: string; issue: string; severity: 'error' | 'warning' }[] = [];

    // Handle case where serverData has different structure than expected
    if (!serverData || typeof serverData !== 'object') {
      issues.push({
        name: 'API Response',
        issue: 'Server response is not in expected format',
        severity: 'error',
      });
      setConfigIssues(issues);
      return;
    }

    // Check for cookie exists but not logged in
    if (document.cookie.includes('sb-') && !user) {
      issues.push({
        name: 'components/auth-provider.tsx',
        issue:
          'Browser has auth cookies but client auth state is not set - cookie parsing may be incorrect',
        severity: 'error',
      });
    }

    // Check for client/server mismatch 
    const clientHasAuth = !!user;
    
    // Use the direct 'authenticated' field from the updated API response
    const serverHasAuth = serverData.authenticated === true; // Check boolean directly

    if (clientHasAuth !== serverHasAuth) {
      issues.push({
        name: 'Auth State Synchronization',
        issue: `Client auth (${clientHasAuth ? 'logged in' : 'logged out'}) doesn't match server auth (${serverHasAuth ? 'logged in' : 'logged out'})`,
        severity: 'error',
      });

      // Additional detail for server-only auth
      if (!clientHasAuth && serverHasAuth) {
        issues.push({
          name: 'Server Session Persistence',
          issue:
            "Server sees you as logged in but browser doesn't. Try clearing cookies AND restarting the server.",
          severity: 'error',
        });
      }
    }

    // Check for supabase client initialization
    if (!supabase) {
      issues.push({
        name: 'components/auth-provider.tsx',
        issue: 'Supabase client not properly initialized in auth provider',
        severity: 'error',
      });
    }

    // Parse cookies for debugging
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const authCookiesFound = cookies.filter((c) => c.startsWith('sb-'));
    setAuthCookies(authCookiesFound);

    // Check for cookies without auth state
    if (authCookiesFound.length > 0 && !user && !serverHasAuth) {
      issues.push({
        name: 'Cookie Parsing',
        issue: 'Auth cookies found but not being correctly parsed by either client or server',
        severity: 'error',
      });
    }

    setConfigIssues(issues);
  };

  // Force a complete authentication reset
  const forceAuthReset = async () => {
    try {
      // Clear cookies via API
      await fetch('/api/auth/clear-cookies');

      // Clear any local storage items that might be related to auth
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase-auth-token');
      sessionStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase-auth-token');

      // Force reload page to ensure all state is cleared
      window.location.href = '/debug/auth-status';
    } catch (error) {
      console.error('Error during forced auth reset:', error);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Authentication Status Debug</h1>
      <p className="mb-6 text-muted-foreground">
        This page shows the authentication state as seen by both the client and server.
      </p>

      {/* Authentication Issues */}
      {configIssues.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" /> Authentication Issues Detected
          </h2>
          <div className="space-y-3">
            {configIssues.map((issue, i) => (
              <Alert key={i} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Issue in {issue.name}</AlertTitle>
                <AlertDescription>{issue.issue}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Client/Server Auth Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Client Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Client Auth State</CardTitle>
            <CardDescription>Auth state from useAuth() hook</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="font-medium">Session</div>
                  <div className="text-sm text-muted-foreground">
                    {session ? 'Active' : 'No active session'}
                  </div>
                </div>

                <div>
                  <div className="font-medium">User</div>
                  <div className="text-sm text-muted-foreground">
                    {user ? `ID: ${user.id.slice(0, 8)}...` : 'Not authenticated'}
                  </div>
                </div>

                {user && (
                  <>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>

                    <div>
                      <div className="font-medium">Last Sign In</div>
                      <div className="text-sm text-muted-foreground">
                        {user.last_sign_in_at || 'Unknown'}
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div>
                    <div className="font-medium text-red-500">Error</div>
                    <div className="text-sm text-red-500">{error.message}</div>
                  </div>
                )}

                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify({ user, session }, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Server Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Server Auth State</CardTitle>
            <CardDescription>Auth state from API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            {isServerLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : serverError ? (
              <div className="text-red-500 py-4">{serverError}</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="font-medium">Session</div>
                  <div className="text-sm text-muted-foreground">
                    {serverAuth?.auth_status.has_session ? 'Active' : 'No active session'}
                  </div>
                </div>

                <div>
                  <div className="font-medium">User</div>
                  <div className="text-sm text-muted-foreground">
                    {serverAuth?.auth_status.has_user
                      ? `ID: ${serverAuth.auth_status.user_id?.slice(0, 8)}...`
                      : 'Not authenticated'}
                  </div>
                </div>

                {serverAuth?.auth_status.has_user && (
                  <>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">
                        {serverAuth.auth_status.user_email}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium">Last Sign In</div>
                      <div className="text-sm text-muted-foreground">
                        {serverAuth.auth_status.last_sign_in || 'Unknown'}
                      </div>
                    </div>
                  </>
                )}

                {(serverAuth?.auth_status.session_error || serverAuth?.auth_status.user_error) && (
                  <div>
                    <div className="font-medium text-red-500">Error</div>
                    <div className="text-sm text-red-500">
                      {serverAuth?.auth_status.session_error || serverAuth?.auth_status.user_error}
                    </div>
                  </div>
                )}

                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(serverAuth, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browser Cookies Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Browser Auth Cookies</CardTitle>
          <CardDescription>Auth cookies found in the browser</CardDescription>
        </CardHeader>
        <CardContent>
          {authCookies.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>{authCookies.length} Supabase auth cookies found</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {authCookies.map((cookie, i) => (
                  <li key={i} className="text-sm">
                    {cookie.split('=')[0]}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <span>No Supabase auth cookies found</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Possible File Issues */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Auth Configuration Analysis</CardTitle>
          <CardDescription>Analyzing auth-related files for issues</CardDescription>
        </CardHeader>
        <CardContent>
          {configIssues.length > 0 ? (
            <div className="space-y-4">
              <p className="text-red-500 font-medium">
                Found {configIssues.length} potential issues:
              </p>
              {configIssues.map((issue, i) => (
                <div
                  key={i}
                  className="p-3 border border-red-200 rounded-md bg-red-50 dark:bg-red-950 dark:border-red-800"
                >
                  <div className="font-medium">File: {issue.name}</div>
                  <div className="text-sm mt-1">{issue.issue}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span>No obvious configuration issues detected</span>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Key files for authentication:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code>components/auth-provider.tsx</code> - Client auth state management
              </li>
              <li>
                <code>utils/supabase/unified.ts</code> - Unified client utilities
              </li>
              <li>
                <code>middleware.ts</code> - Auth middleware for protected routes
              </li>
              <li>
                <code>utils/supabase/server.ts</code> - Server-side auth utilities
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <Button onClick={fetchServerStatus}>Refresh Status</Button>
        <Button
          variant="destructive"
          onClick={() => (window.location.href = '/api/auth/clear-cookies')}
        >
          Clear Auth Cookies
        </Button>
        <Button variant="destructive" onClick={forceAuthReset}>
          Force Complete Reset
        </Button>
      </div>
    </div>
  );
}
