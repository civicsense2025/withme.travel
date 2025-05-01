/**
 * error-logger.ts
 * Centralized error logging mechanism for client-side errors
 */

import {
  getSafeSentry,
  configureScopeIfAvailable,
  captureExceptionSafely,
} from './sentry-safe-init';

// Constants for error categories
export enum ErrorCategory {
  API = 'API',
  NETWORK = 'NETWORK',
  UI = 'UI',
  AUTH = 'AUTH',
  DATA = 'DATA',
  UNKNOWN = 'UNKNOWN',
}

// Interface for error data we want to log
export interface ErrorLog {
  message: string;
  category: ErrorCategory;
  source: string;
  timestamp: string;
  stack?: string;
  context?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
  };
}

// Create a safe Sentry instance
const safeSentry = getSafeSentry();

/**
 * Log an error to the console and to analytics/monitoring services
 */
export function logError(
  error: Error | string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  source: string = 'client',
  context: Record<string, any> = {}
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  // Create the error log object
  const errorLog: ErrorLog = {
    message: errorMessage,
    category,
    source,
    timestamp: new Date().toISOString(),
    stack: errorStack,
    context,
  };

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', errorLog);
  }

  // Use safe Sentry methods that won't throw errors
  try {
    captureExceptionSafely(error);

    // Add additional context using the safe wrapper
    configureScopeIfAvailable((scope) => {
      scope.setTag('category', category);
      scope.setTag('source', source);

      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    });
  } catch (e) {
    // This shouldn't happen due to our safe wrappers, but just in case
    console.error('Failed to log error with Sentry:', e);
  }

  // Log to your own API endpoint in production
  if (process.env.NODE_ENV === 'production') {
    try {
      // Don't await this - fire and forget
      fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
        // Use keepalive to ensure the request completes even during page unloads
        keepalive: true,
      }).catch((e) => {
        console.error('Failed to send error log to API:', e);
      });
    } catch (e) {
      // Don't let logging errors cause additional issues
      console.error('Failed to log error to API:', e);
    }
  }
}

/**
 * Log an API error with appropriate context
 */
export function logApiError(
  error: Error | string,
  endpoint: string,
  method: string,
  additionalContext: Record<string, any> = {}
): void {
  const context = {
    endpoint,
    method,
    ...additionalContext,
  };

  logError(error, ErrorCategory.API, 'api-client', context);
}

/**
 * Log a network error with appropriate context
 */
export function logNetworkError(
  error: Error,
  url: string,
  additionalContext: Record<string, any> = {}
): void {
  const context = {
    url,
    online: typeof navigator !== 'undefined' ? navigator.onLine : null,
    ...additionalContext,
  };

  logError(error, ErrorCategory.NETWORK, 'fetch', context);
}

/**
 * Initialize global error handlers for uncaught errors
 */
export function initializeErrorLogging(): void {
  if (typeof window !== 'undefined') {
    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      logError(
        event.error || new Error(event.message),
        ErrorCategory.UNKNOWN,
        event.filename || 'window',
        {
          lineno: event.lineno,
          colno: event.colno,
          timestamp: event.timeStamp,
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

      logError(error, ErrorCategory.UNKNOWN, 'promise', {
        timestamp: event.timeStamp,
        reason: String(event.reason),
      });
    });

    // Optionally intercept fetch requests to log network errors
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      try {
        const response = await originalFetch(input, init);

        // You could also log failed responses (4xx, 5xx) here

        return response;
      } catch (error) {
        const url =
          typeof input === 'string' ? input : input instanceof Request ? input.url : 'unknown';

        logNetworkError(error as Error, url);
        throw error;
      }
    };
  }
}
