"use client"

import React, { useEffect } from 'react';
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"
import { SearchProvider } from "@/contexts/search-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookieConsent } from "@/components/cookie-consent"
import { CommandMenu } from "@/components/search/command-menu"
import { CsrfProvider } from "@/components/csrf-provider"
import { Suspense } from "react"
import { usePathname } from 'next/navigation'
import { initializeErrorLogging } from '@/utils/error-logger';
import { initPerformanceMonitoring } from '@/utils/web-vitals';
import { GlobalErrorBoundary } from '@/components/global-error-boundary';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname()
  const showNavbar = !pathname?.startsWith('/trips/public')

  // Initialize error logging and performance monitoring
  useEffect(() => {
    // Set up global error handlers
    initializeErrorLogging();
    
    // Set up performance monitoring
    initPerformanceMonitoring();
    
    // Log the initialization
    if (process.env.NODE_ENV === 'development') {
      console.log('Error tracking and performance monitoring initialized');
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthErrorBoundary>
          <CsrfProvider>
            <AuthProvider>
              <SearchProvider>
                <CommandMenu />
                <Suspense>
                  {showNavbar && <Navbar />}
                </Suspense>
                {children}
                <Footer />
                <CookieConsent />
                <Toaster />
              </SearchProvider>
            </AuthProvider>
          </CsrfProvider>
        </AuthErrorBoundary>
      </ThemeProvider>
    </GlobalErrorBoundary>
  )
} 