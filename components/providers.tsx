'use client';

import React from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SearchProvider } from '@/contexts/search-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnbordaProvider } from 'onborda';
import { ResearchProvider } from '@/app/context/research-context';
import { ResearchModal } from '@/components/research/ResearchModal';

const queryClient = new QueryClient();

export function Providers({
  initialSession,
  children,
}: {
  initialSession: Session | null;
  children: ReactNode;
}) {
  return (
    <OnbordaProvider>
      <ThemeProvider>
        <AuthProvider initialSession={initialSession}>
          <QueryClientProvider client={queryClient}>
            <SearchProvider>
              <ResearchProvider>
                {children}
                <ResearchModal />
                <Toaster />
              </ResearchProvider>
            </SearchProvider>
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </OnbordaProvider>
  );
}

export default Providers;
