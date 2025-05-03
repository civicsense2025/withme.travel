import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry for Node.js environment
    Sentry.init({
      dsn: 'https://efb9aa4872bbee4986ef082f4e83352a@o4509229605126144.ingest.us.sentry.io/4509229605912576',
      tracesSampleRate: 1,
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Initialize Sentry for Edge environment
    Sentry.init({
      dsn: 'https://efb9aa4872bbee4986ef082f4e83352a@o4509229605126144.ingest.us.sentry.io/4509229605912576',
      tracesSampleRate: 1,
      debug: false,
    });
  }

  // Don't initialize Sentry on the client through instrumentation
  // This is handled by the Sentry webpack plugin
}

// Add the onRequestError hook to capture errors from nested React Server Components
export const onRequestError: Instrumentation.onRequestError = (...args) => {
  // Forward all arguments to Sentry.captureRequestError
  return Sentry.captureRequestError(...args);
};
