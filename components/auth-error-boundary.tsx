'use client';

import React, { useEffect, useCallback } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

const AuthErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const errorMessage =
    error instanceof AuthError ? error.message : 'An authentication error occurred';

  useEffect(() => {
    toast.error(errorMessage);
  }, [errorMessage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Authentication Error</h2>
        <p className="text-muted-foreground">{errorMessage}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({ children }) => {
  const handleError = useCallback((error: Error) => {
    // Convert standard errors to AuthError format if needed
    if (!(error instanceof AuthError)) {
      return new AuthError(error.message);
    }
    return error;
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={AuthErrorFallback}
      onError={(error: Error) => {
        console.error('[Auth Error Boundary]', error);
      }}
      onReset={() => {
        // Optionally add reset logic here
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
