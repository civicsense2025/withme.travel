'use client';

import { OnbordaProvider } from 'onborda';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <OnbordaProvider>{children}</OnbordaProvider>
    </ThemeProvider>
  );
}
