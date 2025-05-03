'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SearchProvider } from '@/contexts/search-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <SearchProvider>
          {children}
          <Toaster />
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default Providers;
