// utils/sentry-safe-init.ts
// This file provides a safety wrapper around Sentry initialization

interface SentryLikeAPI {
  init?: (options: any) => void;
  captureException?: (error: Error, options?: any) => void;
  withScope?: (callback: (scope: any) => void) => void;
  captureMessage?: (message: string, options?: any) => void;
  captureEvent?: (event: any) => void;
  startTransaction?: (context: any) => any;
  flush?: (timeout?: number) => Promise<boolean>;
  close?: (timeout?: number) => Promise<boolean>;
  // Add other Sentry methods as needed
}

// Create a safe noop version of Sentry that doesn't throw errors
const createNoopSentry = (): SentryLikeAPI => ({
  init: () => {},
  captureException: () => {},
  withScope: () => {},
  captureMessage: () => {},
  captureEvent: () => {},
  startTransaction: () => ({}),
  flush: async () => true,
  close: async () => true,
});

/**
 * Initialize Sentry safely with fallbacks to prevent runtime errors
 
 */

export const initSentrySafely = (Sentry: any, options: any): SentryLikeAPI => {
  // Skip Sentry in development mode to avoid errors
  if (process.env.NODE_ENV === 'development') {
    console.info('Sentry disabled in development mode');
    return createNoopSentry();
  }

  // If Sentry is undefined, return a noop implementation
  if (!Sentry) {
    console.warn('Sentry is not available, using noop implementation');
    return createNoopSentry();
  }

  // Try to initialize Sentry with the provided options
  try {
    if (typeof Sentry.init === 'function') {
      Sentry.init(options);
    } else {
      console.warn('Sentry.init is not a function, skipping initialization');
    }

    // Return the initialized Sentry if successful
    return Sentry;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);

    // Return a noop implementation if initialization fails
    return createNoopSentry();
  }
};

/**
 * Safely execute a Sentry function without throwing errors
 
 */

export const executeSentryMethodSafely = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch (error) {
    console.warn('Sentry method execution failed:', error);
    return fallback;
  }
};

// Export a safe version to use throughout the app
export const getSafeLogger = (Sentry: any) => {
  const safeSentry = Sentry || createNoopSentry();

  return {
    captureException: (error: Error, options?: any) => {
      try {
        if (typeof safeSentry.captureException === 'function') {
          safeSentry.captureException(error, options);
        }
      } catch (e) {
        console.error('Failed to log exception to Sentry:', e);
      }
    },

    captureMessage: (message: string, options?: any) => {
      try {
        if (typeof safeSentry.captureMessage === 'function') {
          safeSentry.captureMessage(message, options);
        }
      } catch (e) {
        console.error('Failed to log message to Sentry:', e);
      }
    }
  };
};

/**
 * Utility functions for safely initializing and using Sentry
 
 */
import * as Sentry from '@sentry/nextjs';

// Private variable to track initialization state
let _sentryInitialized = false;

/**
 * Safely initialize Sentry with proper error handling
 * Returns true if initialization succeeded
 
 */
export function initSentryInternalSafely(): boolean {
  // Skip in development mode
  if (process.env.NODE_ENV === 'development') {
    console.info('Sentry disabled in development mode');
    return false;
  }

  // If already initialized, return true
  if (_sentryInitialized) {
    return true;
  }

  try {
    if (typeof Sentry.init !== 'function') {
      console.warn('Sentry.init is not available');
      return false;
    }

    // Initialize Sentry (skipping client check since the API has changed)
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      // Adjust this value in production, or use tracesSampler for greater control
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      environment: process.env.NODE_ENV,
      ignoreErrors: [
        // Common errors to ignore
        'top.GLOBALS',
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    });

    // Mark as initialized
    _sentryInitialized = true;
    return true;
  } catch (error) {
    console.warn('Failed to initialize Sentry:', error);
    return false;
  }
}

/**
 * Get a safe Sentry instance that won't throw if methods are missing
 */
export function getSafeSentry() {
  const safeProxy = new Proxy<typeof Sentry>(Sentry as typeof Sentry, {
    get(target, prop) {
      try {
        const value = (Sentry as any)[prop];
        // If it's a function, wrap it to catch errors
        if (typeof value === 'function') {
          return (...args: any[]) => {
            try {
              return value(...args);
            } catch (error) {
              console.warn(`Sentry.${String(prop)} failed:`, error);
              return undefined;
            }
          };
        }
        return value;
      } catch (error) {
        console.warn(`Failed to access Sentry.${String(prop)}:`, error);
        return undefined;
      }
    },
  });

  return safeProxy;
}

/**
 * Safely configure Sentry scope with proper error handling
 * Updated to use withScope which is available in newer versions
 
 */
export function configureScopeIfAvailable(scopeConfig: (scope: any) => void): void {
  try {
    // Use withScope instead of configureScope
    if (typeof Sentry.withScope === 'function') {
      Sentry.withScope(scopeConfig);
    }
  } catch (error) {
    console.warn('Failed to configure Sentry scope:', error);
  }
}

/**
 * Safely capture exception with proper error handling
 
 */
export function captureExceptionSafely(
  error: Error | unknown,
  captureContext?: any
): string | undefined {
  try {
    if (typeof Sentry.captureException === 'function') {
      return Sentry.captureException(error, captureContext);
    }
  } catch (sentryError) {
    console.warn('Failed to capture exception with Sentry:', sentryError);
  }
  return undefined;
}