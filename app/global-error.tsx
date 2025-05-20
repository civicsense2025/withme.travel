'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

// Make Sentry optional to avoid build errors
let Sentry: any;
try {
  Sentry = require('@sentry/nextjs');
} catch (e) {
  // Fallback if Sentry is not available - silent in production
  Sentry = {
    captureException: (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error captured (Sentry not available):', error);
      }
    },
  };
}

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to report error to Sentry:', e);
      }
    }
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
