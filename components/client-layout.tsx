'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SearchProvider } from '@/contexts/search-context';
import { CommandMenu } from '@/components/search/command-menu';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isFullscreenPath = pathname?.startsWith('/trips/') || pathname?.startsWith('/itineraries/');
  const showFooter = !isFullscreenPath && !pathname?.startsWith('/auth/');

  return (
    <ThemeProvider>
      <AuthErrorBoundary>
        <AuthProvider initialSession={null}>
          <SearchProvider>
            <CommandMenu />
            <Suspense fallback={null}>
              <main className="flex-grow">{children}</main>
              {showFooter && <Footer />}
            </Suspense>
            <CookieConsent />
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </ThemeProvider>
  );
}
