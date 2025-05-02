'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrowserClient } from '@/utils/supabase/client';
import { StateInspector } from '@/components/debug';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';

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
    apiTestResult: null
  });
  
  const [cookies, setCookies] = useState<CookieInfo[]>([]);
  const [localStorageItems, setLocalStorageItems] = useState<Record<string, string>>({});
  const [sessionStorageItems, setSessionStorageItems] = useState<Record<string, string>>({});
  
  const refreshAuthState = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      
      setAuthState({
        session: data.session,
        user: data.session?.user || null,
        error,
        loading: false,
        apiTestResult: authState.apiTestResult
      });
    } catch (e) {
      setAuthState({
        session: null,
        user: null,
        error: e,
        loading: false,
        apiTestResult: authState.apiTestResult
      });
    }
  };
  
  const refreshStorageInfo = () => {
    // Get cookies
    const cookieList: CookieInfo[] = [];
    if (document.cookie !== '') {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookieList.push({
          name,
          value: value || '',
          domain: 'Same as page',
          path: '/',
          expires: 'Session',
          size: (name?.length || 0) + (value?.length || 0),
          httpOnly: false, // Can't detect from JS
          secure: location.protocol === 'https:',
          sameSite: 'Lax', // Default, can't detect from JS
        });
      });
    }
    setCookies(cookieList);
    
    // Get localStorage
    const localItems: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localItems[key] = localStorage.getItem(key) || '';
      }
    }
    setLocalStorageItems(localItems);
    
    // Get sessionStorage
    const sessionItems: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionItems[key] = sessionStorage.getItem(key) || '';
      }
    }
    setSessionStorageItems(sessionItems);
  };
  
  const clearAllCookies = () => {
    const allCookies = document.cookie.split(';');
    
    for (let i = 0; i < allCookies.length; i++) {
      const cookie = allCookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
    
    refreshStorageInfo();
    refreshAuthState();
  };
  
  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      refreshAuthState();
      refreshStorageInfo();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };
  
  const callAuthApiEndpoint = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      return data;
    } catch (e) {
      return { error: e };
    }
  };
  
  useEffect(() => {
    refreshAuthState();
    refreshStorageInfo();
    
    // Set up session change listener
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      refreshAuthState();
      refreshStorageInfo();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
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
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            disabled={!authState.session}
          >
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
              Current authentication state: {' '}
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
              {authState.user ? `Logged in as ${authState.user.email}` : 'No authenticated user'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StateInspector data={authState.user} title="User Object" expanded={true} />
          </CardContent>
          <CardFooter>
            <Link href="/test-auth">
              <Button variant="outline" size="sm">Go to Auth Testing Page</Button>
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
                {cookies.length} cookies found {' '}
                <Button 
                  onClick={refreshStorageInfo} 
                  variant="ghost" 
                  size="sm"
                >
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
                {Object.keys(localStorageItems).length} items in localStorage {' '}
                <Button 
                  onClick={refreshStorageInfo} 
                  variant="ghost" 
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector data={localStorageItems} title="Local Storage Items" expanded={true} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessionStorage">
          <Card>
            <CardHeader>
              <CardTitle>Session Storage</CardTitle>
              <CardDescription>
                {Object.keys(sessionStorageItems).length} items in sessionStorage {' '}
                <Button 
                  onClick={refreshStorageInfo} 
                  variant="ghost" 
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector data={sessionStorageItems} title="Session Storage Items" expanded={true} />
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
                      setAuthState(prev => ({ ...prev, apiTestResult: result }));
                    }} 
                    variant="outline"
                  >
                    Test /api/auth/me
                  </Button>
                  
                  {authState.apiTestResult && (
                    <div className="mt-4">
                      <StateInspector data={authState.apiTestResult} title="API Response" expanded={true} />
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