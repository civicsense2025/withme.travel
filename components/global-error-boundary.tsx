'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

// Let's make Sentry optional since it may not be installed yet
let Sentry: any;
try {
  Sentry = require('@sentry/nextjs');
} catch (e) {
  // Sentry is not available
  Sentry = {
    captureException: (error: Error) => {
      return console.warn('Sentry not available, error not reported:', error.message);
    },
  };
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary component that can be used at the root level
 * to catch all unhandled errors in the application.
 *
 * This can be used in the root layout to provide a global fallback UI.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log the error to the console
    console.error('Global error caught by boundary:', error, errorInfo);

    // Report to error monitoring service if available
    try {
      if (Sentry) {
        Sentry.captureException(error);
      }
    } catch (sentryError) {
      console.error('Failed to report error:', sentryError);
    }

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    return (window.location.href = '/');
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
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
                We've encountered an unexpected error. Our team has been notified.
              </p>

              {/* Show a more technical error in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-muted text-left rounded-md overflow-auto w-full">
                  <p className="text-sm font-medium">
                    Error details (only visible in development):
                  </p>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Component Stack:</p>
                      <pre className="mt-1 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A higher-order component that wraps a component with the GlobalErrorBoundary.
 *
 * @param Component The component to wrap with the error boundary
 * @param fallback Optional custom fallback UI
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';

  const WithErrorBoundary: React.FC<P> = (props) => (
    <GlobalErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

/**
 * A hook to programmatically throw errors to be caught by the nearest error boundary.
 */
export function useErrorBoundary(): (error: Error) => void {
  return (error: Error) => {
    throw error;
  };
}
