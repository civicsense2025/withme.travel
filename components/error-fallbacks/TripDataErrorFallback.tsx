'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface TripDataErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Error recovery component for main trip data errors
 */
export function TripDataErrorFallback({ error, resetErrorBoundary }: TripDataErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading trip data</AlertTitle>
        <AlertDescription>
          {error.message || 'There was an error loading the trip data'}
        </AlertDescription>
      </Alert>
      <div className="flex gap-4 justify-center">
        <Button onClick={resetErrorBoundary}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  );
}
