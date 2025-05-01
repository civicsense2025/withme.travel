'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/logo';
import { AuthSellingPoints } from '@/components/auth-selling-points';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [loginContext, setLoginContext] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get redirect path and decode safely
  const redirectPath = searchParams.get('redirect') || '/';
  const [safeRedirectPath, setSafeRedirectPath] = useState('/');

  // Process the redirect path safely
  useEffect(() => {
    try {
      // Remove leading/trailing whitespace
      let cleanPath = redirectPath.trim();

      // Try to decode if it looks URL-encoded
      if (cleanPath.includes('%')) {
        cleanPath = decodeURIComponent(cleanPath);
      }

      // Ensure path starts with a slash if it's a relative path
      if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
        cleanPath = '/' + cleanPath;
      }

      setSafeRedirectPath(cleanPath);
    } catch (e) {
      console.error('Error processing redirect path:', e);
      setSafeRedirectPath('/');
    }
  }, [redirectPath]);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      setIsRedirecting(true);

      // Add small delay for UI feedback
      const timer = setTimeout(() => {
        router.push(safeRedirectPath);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, safeRedirectPath, router]);

  // Process URL parameters - message and login context
  useEffect(() => {
    // Handle message from query params
    const message = searchParams.get('message');
    if (message) {
      setMessage(message);

      // Show toast for important messages
      if (message.includes('expired') || message.includes('out') || message.includes('failed')) {
        toast({
          title: 'Authentication Notice',
          description: message,
        });
      }
    }

    // Detect login context from redirect path
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      if (redirectParam.includes('/trips/create')) {
        setLoginContext('to create a new trip');
      } else if (redirectParam.includes('/trips')) {
        setLoginContext('to access your trips');
      } else if (redirectParam.includes('/saved')) {
        setLoginContext('to view your saved items');
      } else if (redirectParam.includes('/profile')) {
        setLoginContext('to access your profile');
      }
    }
  }, [searchParams, toast]);

  // Show loading state while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md flex flex-col text-center">
          <div className="p-3">
            <Spinner size="xl" variant="primary" />
          </div>
          <p className="text-muted-foreground">
            {isRedirecting ? 'Redirecting you now...' : 'Checking authentication status...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render login form if already logged in
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md flex flex-col">
        <div className="md:hidden mb-6">
          <AuthSellingPoints />
        </div>

        <Card className="border border-border/10 dark:border-border/10 shadow-xl dark:shadow-2xl dark:shadow-black/20">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold text-center">welcome back!</CardTitle>
            <CardDescription className="text-center">
              {loginContext ? (
                <>sign in {loginContext}</>
              ) : (
                <>sign in to continue planning your adventures</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">don't have an account?</span>{' '}
              <Link
                href={`/signup${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
                className="text-primary hover:underline"
              >
                sign up
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="hidden md:block mt-8">
          <AuthSellingPoints />
        </div>
      </div>
    </div>
  );
}
