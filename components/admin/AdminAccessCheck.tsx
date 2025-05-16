'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminAccessCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders its children if the current user is an admin
 */
export default function AdminAccessCheck({ children, fallback = null }: AdminAccessCheckProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthLoading) return;

      try {
        if (!user) {
          // No user - redirect to login
          setIsAdmin(false);
          setIsChecking(false);
          router.push('/login?redirectTo=/admin');
          return;
        }

        // First check user metadata for quick client-side check
        const hasAdminMetadata = user.user_metadata?.is_admin === true;

        // Verify with the server - retry up to 3 times with exponential backoff
        let retries = 0;
        const maxRetries = 3;
        let retryDelay = 1000;
        let isVerifiedAdmin = false;

        while (retries < maxRetries) {
          try {
            const response = await fetch('/api/auth/check-admin');

            if (response.ok) {
              const data = await response.json();
              isVerifiedAdmin = data.isAdmin === true;
              break; // Success, exit the retry loop
            } else if (response.status === 401) {
              // User is not authenticated, redirect to login
              setIsAdmin(false);
              setIsChecking(false);
              router.push('/login?redirectTo=/admin');
              return;
            }

            // If we get here, it's a server error worth retrying
            retries++;
            if (retries < maxRetries) {
              // Wait with exponential backoff before retrying
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              retryDelay *= 2; // Double the delay for next retry
            }
          } catch (e) {
            retries++;
            if (retries < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              retryDelay *= 2;
            }
          }
        }

        setIsAdmin(isVerifiedAdmin);
        setIsChecking(false);
            
        // If not admin, redirect to login
        if (!isVerifiedAdmin) {
          console.log('Not an admin, redirecting to login');
          router.push('/login?redirectTo=/admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('An unexpected error occurred');
        setIsAdmin(false);
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, isAuthLoading, router]);

  // Still loading state
  if (isChecking || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-destructive/10 rounded-lg text-center">
        <p className="text-destructive font-medium mb-2">Access Error</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return fallback;
  }

  // Is admin - render children
  return <>{children}</>;
}
