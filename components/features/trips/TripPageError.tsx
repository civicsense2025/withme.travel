/**
 * @deprecated This component has been moved to components/features/trips/molecules/TripPageError.tsx
 * Please update your imports to use the new location.
 */
'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface TripPageErrorProps {
  tripId: string;
  error?: Error;
}

/**
 * Error component displayed when there's an issue loading the trip page.
 * Provides options to retry loading or navigate back to safety.
 */
export function TripPageError({ tripId, error }: TripPageErrorProps) {
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Only show detailed error in development
    if (process.env.NODE_ENV === 'development' && error) {
      setErrorDetails(error.message || 'Unknown error');
    }
  }, [error]);

  const handleRetry = () => {
    // Reload the current page
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>

        <p className="text-muted-foreground mb-6">
          We encountered an error while trying to load this trip. This could be due to a temporary
          issue or the trip may no longer exist.
        </p>

        {errorDetails && (
          <div className="bg-muted p-3 rounded-md mb-6 w-full overflow-x-auto text-left">
            <code className="text-xs whitespace-pre-wrap">{errorDetails}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button variant="outline" className="flex-1" onClick={handleRetry}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Link href="/trips" className="flex-1">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Return to Trips
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
