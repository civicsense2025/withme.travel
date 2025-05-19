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
import { ArrowLeft, RefreshCw, LogOut, UserIcon, UserX } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import clientGuestUtils from '@/utils/guest';
import { API_ROUTES } from '@/utils/constants/routes';

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
  guestToken?: string | null;
  guestInfo?: any;
}

export default function AuthStatusPage() {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    error: null,
    loading: true,
    apiTestResult: null,
    guestToken: null,
    guestInfo: null,
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

      // Get guest token info
      const guestToken = clientGuestUtils.getToken();
      let guestInfo = null;

      if (guestToken) {
        try {
          const response = await fetch('/api/guest/token');
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              guestInfo = data.guest;
            }
          }
        } catch (error) {
          console.error('Error fetching guest info:', error);
        }
      }

      setAuthState({
        session,
        user,
        error: sessionError || userError,
        loading: false,
        apiTestResult: authState.apiTestResult,
        guestToken,
        guestInfo,
      });
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      setAuthState({
        session: null,
        user: null,
        error,
        loading: false,
        apiTestResult: authState.apiTestResult,
        guestToken: clientGuestUtils.getToken(),
        guestInfo: null,
      });
    }
  }, [authState.apiTestResult]);

  // Effect to refresh auth state on mount
  useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  // Function to refresh storage information (cookies, localStorage, sessionStorage)
  const refreshStorageInfo = useCallback(() => {
    // Get all cookies
    try {
      if (document && document.cookie) {
        const allCookies: CookieInfo[] = [];
        const cookieList = document.cookie.split(';');

        for (const cookie of cookieList) {
          if (!cookie.trim()) continue;
          const [name, value] = cookie.trim().split('=');
          allCookies.push({
            name,
            value,
            domain: 'localhost',
            path: '/',
            expires: 'Session',
            size: name.length + value.length,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
          });
        }

        setCookies(allCookies);
      }
    } catch (error) {
      console.error('Error getting cookies:', error);
    }

    // Get localStorage items
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const items: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            items[key] = localStorage.getItem(key) || '';
          }
        }
        setLocalStorageItems(items);
      }
    } catch (error) {
      console.error('Error getting localStorage:', error);
    }

    // Get sessionStorage items
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const items: Record<string, string> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            items[key] = sessionStorage.getItem(key) || '';
          }
        }
        setSessionStorageItems(items);
      }
    } catch (error) {
      console.error('Error getting sessionStorage:', error);
    }
  }, []);

  // Effect to get storage info on mount
  useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      refreshAuthState();
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to clear all cookies
  const clearAllCookies = () => {
    try {
      const cookieList = document.cookie.split(';');
      for (const cookie of cookieList) {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      toast({
        title: 'Cookies cleared',
        description: 'All cookies have been cleared.',
      });
      refreshStorageInfo();
      refreshAuthState();
    } catch (error) {
      console.error('Error clearing cookies:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cookies. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to call the auth API endpoint
  const callAuthApiEndpoint = async () => {
    try {
      const response = await fetch('/api/auth/me');
      return await response.json();
    } catch (error) {
      console.error('Error calling auth API:', error);
      return { error: 'Failed to call API' };
    }
  };

  // Function to create a guest token
  const createGuestToken = async () => {
    try {
      const response = await fetch('/api/guest/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Debug Guest',
          email: 'debug@withme.travel',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Guest token created',
            description: 'A new guest token has been created.',
          });
          refreshAuthState();
        } else {
          throw new Error(data.error || 'Failed to create guest token');
        }
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error: any) {
      console.error('Error creating guest token:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create guest token',
        variant: 'destructive',
      });
    }
  };

  // Function to remove guest token
  const removeGuestToken = () => {
    try {
      clientGuestUtils.clearToken();

      // Also remove from cookies
      document.cookie = 'guest_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      toast({
        title: 'Guest token removed',
        description: 'The guest token has been removed.',
      });
      refreshAuthState();
      refreshStorageInfo();
    } catch (error) {
      console.error('Error removing guest token:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove guest token',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/debug" className="mr-2" legacyBehavior>
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
              <span
                className={
                  authState.session
                    ? 'text-green-500'
                    : authState.guestToken
                      ? 'text-yellow-500'
                      : 'text-red-500'
                }
              >
                {authState.session
                  ? 'Authenticated'
                  : authState.guestToken
                    ? 'Guest User'
                    : 'Not Authenticated'}
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
              {authState.user
                ? `Logged in as ${authState.user.email}`
                : authState.guestToken
                  ? `Guest: ${authState.guestInfo?.name || 'Unknown Guest'}`
                  : `No authenticated user`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authState.user ? (
              <StateInspector data={authState.user} title="User Object" expanded={true} />
            ) : authState.guestToken ? (
              <StateInspector data={authState.guestInfo} title="Guest Info" expanded={true} />
            ) : (
              <div className="text-center py-4 text-gray-500">
                <UserX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No user or guest is authenticated</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/test-auth" legacyBehavior>
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
          <TabsTrigger value="guest">Guest Mode</TabsTrigger>
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
                {Object.keys(localStorageItems).length} items found{' '}
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
                {Object.keys(sessionStorageItems).length} items found{' '}
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

        <TabsContent value="guest">
          <Card>
            <CardHeader>
              <CardTitle>Guest User Mode</CardTitle>
              <CardDescription>
                Create or remove guest tokens for unauthenticated users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div
                  className={`p-4 rounded-md ${authState.guestToken ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                >
                  <h3 className="text-lg font-medium mb-2">Guest Token Status</h3>
                  <p>
                    {authState.guestToken ? 'Guest token is present' : 'No guest token is present'}
                  </p>
                  {authState.guestToken && (
                    <div className="mt-4 space-y-2">
                      <div>
                        <strong>Token:</strong> {authState.guestToken.substring(0, 8)}...
                      </div>
                      {authState.guestInfo && (
                        <>
                          <div>
                            <strong>Name:</strong> {authState.guestInfo.name}
                          </div>
                          {authState.guestInfo.email && (
                            <div>
                              <strong>Email:</strong> {authState.guestInfo.email}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={createGuestToken}
                    disabled={!!authState.guestToken || !!authState.session}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Create Guest Token
                  </Button>

                  <Button
                    onClick={removeGuestToken}
                    variant="outline"
                    disabled={!authState.guestToken}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Remove Guest Token
                  </Button>
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
