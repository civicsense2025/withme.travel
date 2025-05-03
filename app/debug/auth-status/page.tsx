'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBrowserClient } from '@/utils/supabase/unified';
import { StateInspector } from '@/components/debug';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

type CookieInfo = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: string;
  size: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
};

interface AuthState {
  session: any;
  user: any;
  error: any;
  loading: boolean;
  apiTestResult?: any;
}

export default function AuthStatusPage() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    error: null,
    loading: true,
    apiTestResult: null,
  });

  const [cookies, setCookies] = useState<CookieInfo[]>([]);
  const [localStorageItems, setLocalStorageItems] = useState<Record<string, string>>({});
  const [sessionStorageItems, setSessionStorageItems] = useState<Record<string, string>>({});

  const refreshAuthState = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const supabase = getBrowserClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      setAuthState({
        session,
        user,
        error: sessionError || userError,
        loading: false,
        apiTestResult: authState.apiTestResult,
      });
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      setAuthState({ session: null, user: null, error, loading: false, apiTestResult: authState.apiTestResult });
    }
  }, []);

  const refreshStorageInfo = useCallback(() => {
    // Fetch cookies
    const allCookies = document.cookie.split(';').map((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      // Basic parsing, might need refinement for complex attributes
      return {
        name,
        value: rest.join('='),
        // Placeholder for other attributes - full parsing is complex
        domain: window.location.hostname,
        path: '/',
        expires: 'Session', // Placeholder
        size: cookie.length, // Approximate size
        httpOnly: false, // Cannot detect from JS
        secure: location.protocol === 'https:',
        sameSite: 'Lax', // Placeholder
      };
    });
    setCookies(allCookies);

    // Fetch localStorage
    const lsItems: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        lsItems[key] = localStorage.getItem(key) || '';
      }
    }
    setLocalStorageItems(lsItems);

    // Fetch sessionStorage
    const ssItems: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        ssItems[key] = sessionStorage.getItem(key) || '';
      }
    }
    setSessionStorageItems(ssItems);
  }, []);

  const clearAllCookies = useCallback(() => {
    fetch('/api/auth/clear-cookies', { method: 'POST' })
      .then(() => {
        // Refresh cookies display after attempting to clear
        refreshStorageInfo();
        // Optionally refresh auth state too
        refreshAuthState();
        toast.success('Attempted to clear auth cookies. Refresh may be needed.');
      })
      .catch((error) => {
        console.error('Error clearing cookies:', error);
        toast.error('Failed to clear cookies.');
      });
  }, [refreshStorageInfo, refreshAuthState]);

  const handleLogout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // State will be updated via onAuthStateChange listener
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      refreshAuthState(); // Refresh state on error
    } finally {
      // setAuthState((prev) => ({ ...prev, loading: false })); // Listener handles update
    }
  }, [refreshAuthState]);

  const callAuthApiEndpoint = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API call error:', error);
      return { error: error instanceof Error ? error.message : 'API request failed' };
    }
  }, []);

  useEffect(() => {
    refreshAuthState();
    refreshStorageInfo();

    // Set up session change listener
    const supabase = getBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      refreshAuthState();
      refreshStorageInfo();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuthState, refreshStorageInfo]);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/debug" className="mr-2">
          <ArrowLeft className="h-4 w-4 inline-block" />
        </Link>
        <h1 className="text-3xl font-bold">Authentication Status</h1>

        <div className="ml-auto space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAuthState}
            disabled={authState.loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={!authState.session}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
        <p>
          This page shows the current authentication state and allows debugging auth-related issues.
          You can view auth details, storage contents, and manually test endpoints.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Auth Status</CardTitle>
            <CardDescription>
              Current authentication state:{' '}
              <span className={authState.session ? 'text-green-500' : 'text-red-500'}>
                {authState.session ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StateInspector data={authState} title="Auth State" expanded={true} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              {authState.user ? `Logged in as ${authState.user.email}` : `No authenticated user`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StateInspector data={authState.user} title="User Object" expanded={true} />
          </CardContent>
          <CardFooter>
            <Link href="/test-auth">
              <Button variant="outline" size="sm">
                Go to Auth Testing Page
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="cookies">
        <TabsList className="mb-4">
          <TabsTrigger value="cookies">Cookies</TabsTrigger>
          <TabsTrigger value="localStorage">Local Storage</TabsTrigger>
          <TabsTrigger value="sessionStorage">Session Storage</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="cookies">
          <Card>
            <CardHeader>
              <CardTitle>Cookies</CardTitle>
              <CardDescription>
                {cookies.length} cookies found{' '}
                <Button onClick={refreshStorageInfo} variant="ghost" size="sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  onClick={clearAllCookies}
                  variant="outline"
                  size="sm"
                  className="ml-2 text-red-500"
                >
                  Clear All Cookies
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector data={cookies} title="Browser Cookies" expanded={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localStorage">
          <Card>
            <CardHeader>
              <CardTitle>Local Storage</CardTitle>
              <CardDescription>
                {Object.keys(localStorageItems).length} items in localStorage{' '}
                <Button onClick={refreshStorageInfo} variant="ghost" size="sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector
                data={localStorageItems}
                title="Local Storage Items"
                expanded={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessionStorage">
          <Card>
            <CardHeader>
              <CardTitle>Session Storage</CardTitle>
              <CardDescription>
                {Object.keys(sessionStorageItems).length} items in sessionStorage{' '}
                <Button onClick={refreshStorageInfo} variant="ghost" size="sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector
                data={sessionStorageItems}
                title="Session Storage Items"
                expanded={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Auth API Endpoints</CardTitle>
              <CardDescription>Test authentication-related API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Button
                    onClick={async () => {
                      const result = await callAuthApiEndpoint();
                      setAuthState((prev) => ({ ...prev, apiTestResult: result }));
                    }}
                    variant="outline"
                  >
                    Test /api/auth/me
                  </Button>

                  {authState.apiTestResult && (
                    <div className="mt-4">
                      <StateInspector
                        data={authState.apiTestResult}
                        title="API Response"
                        expanded={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Debug tools are only available in development mode. Add additional auth tests in{' '}
          <code className="text-xs bg-gray-100 p-0.5 rounded">app/debug/auth-status/page.tsx</code>
        </p>
      </div>
    </div>
  );
}
