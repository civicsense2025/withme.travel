// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'development') {
  console.info('Sentry disabled in development mode');
} else {
  Sentry.init({
    dsn: 'https://efb9aa4872bbee4986ef082f4e83352a@o4509229605126144.ingest.us.sentry.io/4509229605912576',

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
