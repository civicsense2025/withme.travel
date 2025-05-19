'use client';

import React from 'react';
import { AuthModalProvider } from '@/app/context/auth-modal-context';
import { AuthModal } from '@/components/features/groups/organisms/AuthModal';
import { useEffect, useState } from 'react';
import { initializeErrorLogging } from '@/utils/error-logger';
import { initPerformanceMonitoring } from '@/utils/web-vitals';
import { ClassErrorBoundary } from '@/components/features/error-boundary';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Analytics } from '@vercel/analytics/react';
import { useAuth } from '@/hooks/useAuth';
import { ClientOpenReplayWrapper } from '@/components/analytics/ClientOpenreplayWrapper';

/**
 * Client-side providers that ensure client-only components
 * are only mounted in the browser to prevent hydration mismatches
 */
export function ClientSideProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);

    try {
      // initializeErrorLogging();
      initPerformanceMonitoring();

      if (process.env.NODE_ENV === 'development') {
        console.log('Client-side services initialized (error logging temporarily disabled)');
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
  return (
    <AuthModalProvider>
      <ClassErrorBoundary>
        <ThemeProvider>
          {/* Add OpenReplayProvider around all content */}
          <ClientOpenReplayWrapper>
            {children}
            {/* TODO: No Toaster component found in components/ui/toaster.tsx. Implement or clarify if needed. */}
            {/* TODO: No global AuthModal available. If you want a global auth modal, implement or re-export it from features/auth. The current AuthModal requires onSignIn/onClose props. */}
            {/* <AuthModal /> */}
            <Analytics />
          </ClientOpenReplayWrapper>
        </ThemeProvider>
      </ClassErrorBoundary>
    </AuthModalProvider>
  );
}
