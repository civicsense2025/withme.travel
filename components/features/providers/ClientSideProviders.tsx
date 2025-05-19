'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { ClassErrorBoundary } from '@/components/features/error-boundary';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Analytics } from '@vercel/analytics/react';

/**
 * Client-side providers that ensure client-only components
 * are only mounted in the browser to prevent hydration mismatches
 */
export function ClientSideProviders({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR or initial render, return a minimal placeholder
  if (!isMounted) {
    return null; // Return null for cleaner hydration
  }

  // Once mounted in the browser, return the full component tree
  return (
    <ClassErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThemeProvider>
        {children}
        <Analytics />
      </ThemeProvider>
    </ClassErrorBoundary>
  );
} 