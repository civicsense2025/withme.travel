'use client';

import { useEffect, useState } from 'react';

/**
 * A client-side component that handles client-specific functionality for the homepage.
 * This component can be expanded to handle more client-side features like animations.
 */
export function HomeClientSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Performance logging
    if (window.performance) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log(`Page load time: ${navigation.loadEventEnd - navigation.startTime}ms`);
      }
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return null;
}
