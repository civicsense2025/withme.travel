'use client';

import React from 'react';
import { AuthModalProvider } from '@/app/context/auth-modal-context';
import { AuthModal } from '@/components/auth-modal';
import { useEffect, useState } from 'react';
import { initializeErrorLogging } from '@/utils/error-logger';
import { initPerformanceMonitoring } from '@/utils/web-vitals';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';
import { NotificationProvider } from '@/contexts/notification-context';
import { NotificationCountProvider } from '@/contexts/notification-count-context';
import { NotificationRealtimeListener } from '@/components/notification-realtime-listener';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';

/**
 * Client-side providers that ensure client-only components
 * are only mounted in the browser to prevent hydration mismatches
 */
export function ClientSideProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  // Skip authentication for pages that don't need it
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

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
      <GlobalErrorBoundary>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationCountProvider>
            <NotificationProvider>
              <NotificationRealtimeListener />
              {children}
              <Toaster />
            </NotificationProvider>
          </NotificationCountProvider>
          <AuthModal />
          <Analytics />
        </ThemeProvider>
      </GlobalErrorBoundary>
    </AuthModalProvider>
  );
}
