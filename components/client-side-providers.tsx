'use client';

import { useEffect, useState } from 'react';
import { initializeErrorLogging } from '@/utils/error-logger';
import { initPerformanceMonitoring } from '@/utils/web-vitals';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';

/**
 * Client-side providers that ensure client-only components
 * are only mounted in the browser to prevent hydration mismatches
 */
export function ClientSideProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted state
    setIsMounted(true);

    // Initialize client-side services safely after mount
    try {
      initializeErrorLogging();
      initPerformanceMonitoring();

      if (process.env.NODE_ENV === 'development') {
        console.log('Client-side services initialized');
      }
    } catch (error) {
      console.error('Failed to initialize client-side services:', error);
    }
  }, []);

  // During SSR or initial render, return a minimal placeholder
  if (!isMounted) {
    return null; // Return null for cleaner hydration
  }

  // Once mounted in the browser, return the full component tree
  return <GlobalErrorBoundary>{children}</GlobalErrorBoundary>;
}
