'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryButton } from '@/components/features/ui/ErrorBoundaryButton';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// This is your Server Component
function ErrorBoundaryComponent({ error, reset }: ErrorBoundaryProps) {
  console.error('ErrorBoundary caught:', error);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-destructive"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="mt-2 text-muted-foreground">
            We encountered an error while processing your request.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-muted text-left rounded-md overflow-auto w-full">
              <p className="text-sm font-medium">Error details (only visible in development):</p>
              <p className="mt-1 text-xs font-mono text-muted-foreground">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
        {/* Using the client component for interactive elements */}
        <ErrorBoundaryButton onReset={reset} />
      </div>
    </div>
  );
}

// Default export
export default ErrorBoundaryComponent;

// Named export - THIS is the key fix
export const ErrorBoundary = ErrorBoundaryComponent;

interface ClassErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  tripId?: string;
  section?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component that crashed.
 */
export class ClassErrorBoundary extends Component<ClassErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ClassErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report to Sentry with context information
    try {
      Sentry.captureException(error, {
        tags: {
          tripId: this.props.tripId,
          section: this.props.section || 'unknown',
        },
        extra: { errorInfo },
      });
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
    }
    
    // Call the onError callback if provided (for backward compatibility)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * A hook that allows functional components to throw errors that will be caught
 * by the nearest error boundary.
 *
 * @param error The error to throw
 */
export function useErrorBoundary(): (error: Error) => void {
  return (error: Error) => {
    throw error;
  };
}