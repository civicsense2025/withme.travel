'use client';

import { useCallback, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCw } from 'lucide-react';

interface TabErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  section: string;
  tripId: string;
  refetchFn?: () => Promise<void>;
}

/**
 * Error fallback component for tab content errors
 */
export function TabErrorFallback({
  error,
  resetErrorBoundary,
  section,
  tripId,
  refetchFn,
}: TabErrorFallbackProps) {
  useEffect(() => {
    // Report error to Sentry
    Sentry.captureException(error, {
    tags: {
      section,
      tripId,
    },
  });
  }, [error, section, tripId]);

  return (
    <div className="p-4 rounded border border-destructive bg-destructive/10">
      <h3 className="text-lg font-semibold mb-2">Error</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || `There was an error loading the ${section} section`}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <RefreshCw className="h-4 w-4 mr-1" /> Try Again
        </Button>
        {refetchFn && (
          <Button variant="outline" size="sm" onClick={() => refetchFn()}>
            <RotateCw className="h-4 w-4 mr-1" /> Reload Data
          </Button>
        )}
      </div>
    </div>
  );
}