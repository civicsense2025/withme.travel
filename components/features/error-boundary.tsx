// ============================================================================
// ERROR BOUNDARY COMPONENT FOR CLIENT-SIDE ERROR HANDLING
// ============================================================================

import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Props for the ClassErrorBoundary component
 */
interface ClassErrorBoundaryProps {
  /** Fallback UI to display when an error is caught */
  fallback?: React.ReactNode;
  /** Child components to render within the error boundary */
  children: React.ReactNode;
}

/**
 * State for the ClassErrorBoundary component
 */
interface ClassErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error object, if any */
  error: Error | null;
  /** The error info, if any */
  errorInfo: React.ErrorInfo | null;
}

// ============================================================================
// CLASS ERROR BOUNDARY COMPONENT
// ============================================================================

/**
 * A reusable class-based error boundary for client-side rendering.
 * Catches JavaScript errors in child components and displays a fallback UI.
 *
 * @example
 * <ClassErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ClassErrorBoundary>
 */
export class ClassErrorBoundary extends React.Component<
  ClassErrorBoundaryProps,
  ClassErrorBoundaryState
> {
  constructor(props: ClassErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * React lifecycle method to update state when an error is thrown.
   * @param error The error that was thrown
   * @returns Partial state update
   */
  static getDerivedStateFromError(error: Error): Partial<ClassErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * React lifecycle method to perform side effects after an error is caught.
   * @param error The error that was thrown
   * @param errorInfo Additional info about the error
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to an error reporting service or console
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ClassErrorBoundary] Error caught:', error, errorInfo);
    }
    this.setState({ error, errorInfo });
    // Optionally, send error to a logging service here
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // Render custom fallback if provided, else a default message
      return (
        fallback || (
          <div className="p-6 border rounded-lg bg-destructive/10 text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
            <p className="text-muted-foreground mb-4">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
          </div>
        )
      );
    }

    return children;
  }
}