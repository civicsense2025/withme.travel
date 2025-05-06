'use client';

import { OnbordaProvider } from 'onborda';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnbordaProvider>
      {children}
    </OnbordaProvider>
  );
} 