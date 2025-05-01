'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';

// Maximum number of redirects before showing an error
const MAX_REDIRECTS = 3;

export default function SignInRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [isRedirectLoop, setIsRedirectLoop] = useState(false);

  useEffect(() => {
    // Only check for redirect loop based on redirect_count
    const redirectCount = parseInt(searchParams.get('redirect_count') || '0', 10);
    if (redirectCount >= MAX_REDIRECTS) {
      setIsRedirectLoop(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        router.replace(decodeURIComponent(redirectTo));
      } else {
        router.replace('/');
      }
    }
  }, [authLoading, user, router, searchParams]);

  if (isRedirectLoop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            We've detected a potential redirect loop. This could happen if you're trying to access a
            protected resource and the authentication flow isn't working properly.
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Link href="/auth/signin">
            <Button variant="default">Go to Sign In</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  // If user is not authenticated, show the sign in UI
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md flex flex-col text-center space-y-4">
        <div className="p-3">
          <Spinner size="xl" variant="primary" />
        </div>
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Link href="/api/auth/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
