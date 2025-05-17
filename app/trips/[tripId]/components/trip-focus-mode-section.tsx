'use client';

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ClientFocusMode } from '@/components/trips';
import { FocusSessionProvider } from '@/components/focus/focus-session-provider';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Coffee, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface TripFocusModeSectionProps {
  tripId: string;
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

function FocusModeErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  // Log to Sentry
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        section: 'focus-mode',
      },
    });
  }, [error]);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Focus Mode Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{error.message || 'There was an error loading focus mode'}</span>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function TripFocusToggleButton({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="h-8 w-8"
      aria-label={visible ? 'Disable focus mode' : 'Enable focus mode'}
    >
      <Coffee
        className={`h-4 w-4 transition-colors ${visible ? 'text-primary' : 'text-muted-foreground'}`}
      />
    </Button>
  );
}

export function TripFocusModeSection({
  tripId,
  visible,
  onVisibilityChange,
}: TripFocusModeSectionProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for the focus mode component
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <FocusSessionProvider tripId={tripId}>
      <div className="container mx-auto px-4 py-2 sticky top-[60px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <ErrorBoundary
          FallbackComponent={FocusModeErrorFallback}
          onReset={() => {
            // Reset loading state and reload the component
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 300);
          }}
        >
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <ClientFocusMode tripId={tripId}>
              <div className="text-sm mt-2 text-muted-foreground">
                Focus mode helps your team collaborate in real-time
              </div>
            </ClientFocusMode>
          )}
        </ErrorBoundary>
      </div>
    </FocusSessionProvider>
  );
}
