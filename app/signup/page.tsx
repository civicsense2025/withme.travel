'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SignupForm } from '@/components/signup-form';
import { AuthSellingPoints } from '@/components/features/auth';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/hooks/use-auth';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [signupContext, setSignupContext] = useState<string | null>(null);

  // Get redirect path and decode safely
  const redirectPath = searchParams?.get('redirect') || '/';
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
        return router.push('/dashboard?justLoggedIn=1');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, safeRedirectPath, router]);

  // Process URL parameters - message and signup context
  useEffect(() => {
    // Handle message from query params
    const message = searchParams?.get('message');
    if (message) {
      setMessage(message);
    }

    // Detect signup context from redirect path
    const redirectParam = searchParams?.get('redirect');
    if (redirectParam) {
      if (redirectParam.includes('/trips/create')) {
        setSignupContext('to create a new trip');
      } else if (redirectParam.includes('/trips')) {
        setSignupContext('to access trips');
      } else if (redirectParam.includes('/saved')) {
        setSignupContext('to save your favorite places');
      }
    }
  }, [searchParams]);

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

  // Don't render signup form if already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background pt-10 md:pt-16">
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 400 }}>
        {/* AuthSellingPoints at the top */}
        <div className="mb-4 mt-0">
          <AuthSellingPoints small />
        </div>

        <Card className="border border-border/10 dark:border-border/10 shadow-2xl dark:shadow-2xl dark:shadow-black/20 rounded-2xl p-2">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center text-base">
              {signupContext ? (
                <>Join withme.travel {signupContext}</>
              ) : searchParams?.get('invitation') ? (
                <>Join withme.travel and accept your trip invitation</>
              ) : (
                <>Join withme.travel and start planning adventures with friends</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <SignupForm onSuccess={() => router.push('/onboarding')} />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account?</span>{' '}
              <Link
                href={`/login${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
                className="text-primary hover:underline"
              >
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
