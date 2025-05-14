'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const router = useRouter();

  return (
    <div className="p-8 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4 max-w-lg mx-auto">{error.message}</p>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => router.push('/trips')}>Return to Trips</Button>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

interface TripErrorBoundaryProps {
  children: React.ReactNode;
}

export function TripErrorBoundary({ children }: TripErrorBoundaryProps) {
  const handleReset = () => {
    // Any cleanup logic here
    console.log('Error boundary reset');
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
}
