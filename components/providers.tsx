'use client';

import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';
import { SearchProvider } from '@/contexts/search-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';
import { CommandMenu } from '@/components/search/command-menu';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: React.ReactNode;
}

// Simplified provider implementation - remove unnecessary effects
export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const showNavbar = !pathname?.startsWith('/trips/public');

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthErrorBoundary>
        <AuthProvider>
          <SearchProvider>
            {showNavbar && (
              <Suspense fallback={<div className="h-16 bg-background"></div>}>
                <Navbar />
              </Suspense>
            )}
            {children}
            <Footer />
            <CookieConsent />
            <CommandMenu />
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </ThemeProvider>
  );
}
