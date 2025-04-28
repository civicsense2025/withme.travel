"use client"

import React from 'react';
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"
import { SearchProvider } from "@/contexts/search-context"

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthErrorBoundary>
        <AuthProvider>
          <SearchProvider>
            {children}
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </ThemeProvider>
  )
} 