'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a CSS media query matches.
 *
 * @param query - The media query string (e.g., '(min-width: 768px)').
 * @returns True if the media query matches, false otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for SSR compatibility)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial state
    setMatches(mediaQueryList.matches);

    // Add listener for changes
    // Note: Safari < 14 uses addListener/removeListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      mediaQueryList.addListener(listener); // Deprecated but needed for older browsers
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        mediaQueryList.removeListener(listener); // Deprecated
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
