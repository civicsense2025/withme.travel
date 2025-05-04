'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SearchProvider } from '@/contexts/search-context';
import { CommandMenu } from '@/components/search/command-menu';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = !pathname?.startsWith('/auth/');

  return (
    <ThemeProvider>
      <AuthErrorBoundary>
        <AuthProvider initialSession={null}>
          <SearchProvider>
            <CommandMenu />
            <Suspense fallback={null}>{showNavbar && <Navbar />}</Suspense>
            <main className="min-h-[calc(100vh-4rem-4rem)] max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </main>
            <Footer />
            <CookieConsent />
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </ThemeProvider>
  );
}
