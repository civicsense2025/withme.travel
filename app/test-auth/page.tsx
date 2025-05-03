'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthTestPanel from '@/components/auth-test-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';

export default function TestAuthPage() {
  const router = useRouter();
  const { signIn, signOut, user, isLoading } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loginStatus, setLoginStatus] = useState('');
  const [redirect, setRedirect] = useState('/trips/create');

  // Replace CSRF state with local state
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [csrfLoading, setCsrfLoading] = useState(false);

  // Monitor auth state changes and redirect if logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLoginStatus('Login detected, redirecting...');

      // Short timeout to allow state to update before redirect
      const timer = setTimeout(() => {
        router.push(redirect);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router, redirect]);

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        setCsrfLoading(true);
        const response = await fetch('/api/auth/csrf', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch security token');
        }

        const data = await response.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('Error fetching CSRF token:', err);
      } finally {
        setCsrfLoading(false);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleLogin = async () => {
    try {
      setLoginStatus('Logging in...');
      await signIn(email, password);
      setLoginStatus('Login successful! Redirecting soon...');

      // Manual redirect as a fallback (the useEffect should handle it)
      setTimeout(() => {
        if (user) {
          router.push(redirect);
        }
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      setLoginStatus(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    try {
      setLoginStatus('Logging out...');
      await signOut();
      setLoginStatus('Logout successful!');
    } catch (error) {
      console.error('Logout error:', error);
      setLoginStatus(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const refreshCsrfToken = async () => {
    try {
      setLoginStatus('Refreshing CSRF token...');
      setCsrfLoading(true);

      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      setCsrfToken(data.token);

      setLoginStatus(`CSRF token refreshed successfully!`);
    } catch (error) {
      console.error('CSRF refresh error:', error);
      setLoginStatus(
        `CSRF refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setCsrfLoading(false);
    }
  };

  const clearCookies = async () => {
    try {
      setLoginStatus('Clearing cookies...');
      await fetch('/api/auth/clear-cookies', {
        method: 'POST',
        credentials: 'include',
      });
      setLoginStatus('Cookies cleared!');
    } catch (error) {
      console.error('Clear cookies error:', error);
      setLoginStatus(
        `Clear cookies failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Testing Page</h1>

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Login Test</CardTitle>
            <CardDescription>Test the authentication with provided credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect">Redirect After Login</Label>
                <Input
                  id="redirect"
                  value={redirect}
                  onChange={(e) => setRedirect(e.target.value)}
                  placeholder="/trips/create"
                />
              </div>
              {loginStatus && <div className="bg-muted p-2 rounded text-sm">{loginStatus}</div>}
              {user && (
                <div className="bg-muted p-2 rounded text-sm">
                  <p>Logged in as: {user.email}</p>
                  <p>User ID: {user.id}</p>
                  <div className="mt-2">
                    <Button onClick={() => router.push(redirect)} variant="outline" size="sm">
                      Manually Redirect Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              <Button onClick={handleLogin} disabled={isLoading}>
                Login
              </Button>
              <Button onClick={handleLogout} variant="outline" disabled={isLoading}>
                Logout
              </Button>
            </div>
            <div className="space-x-2">
              <Button onClick={refreshCsrfToken} variant="outline" size="sm">
                Refresh CSRF
              </Button>
              <Button onClick={clearCookies} variant="outline" size="sm">
                Clear Cookies
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Auth Test Panel shows the auth state and helps diagnose issues */}
      <AuthTestPanel />
    </div>
  );
}
