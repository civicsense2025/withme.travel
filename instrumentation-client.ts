// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",
  
  // Only enable Replay integration in production to avoid CSP issues in development
  integrations: process.env.NODE_ENV === "production" 
    ? [Sentry.replayIntegration()] 
    : [],

  // Capture Replay for 10% of all sessions,
  // and for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// For Next.js router instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;