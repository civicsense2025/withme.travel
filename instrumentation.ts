// This file is instrumentation for OpenTelemetry and other instrumentation libraries
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only load instrumentation in a Node.js environment, not Edge runtime
    if (process.env.NODE_ENV === 'production') {
      try {
        // Dynamically import to avoid webpack issues
        // These modules will be treated as external due to our next.config.mjs configuration
        const { NodeSDK } = await import('@opentelemetry/sdk-node');
        const { Resource } = await import('@opentelemetry/resources');
        const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions');

        const sdk = new NodeSDK({
          resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: 'withme-travel',
            [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
          }),
        });

        // Initialize the SDK to prevent instrumentation loading issues
        sdk.start();

        console.log('OpenTelemetry SDK initialized in production mode');
      } catch (error) {
        // Don't crash if OpenTelemetry is not available
        console.warn('Failed to initialize OpenTelemetry:', error);
      }
    } else {
      console.info('OpenTelemetry SDK not initialized in development mode');
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('Sentry disabled in development mode');
    return;
  }
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
