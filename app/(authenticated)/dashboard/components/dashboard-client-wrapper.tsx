'use client';

import { useEffect, useState } from 'react';

/**
 * A simple client component wrapper to ensure client-only components
 * are rendered only in the browser
 */
export function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] bg-muted animate-pulse rounded-md"></div>;
  }

  return <>{children}</>;
}
