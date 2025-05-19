/**
 * useMediaQuery Hook
 * 
 * React hook to check if a media query matches.
 * 
 * @module hooks/use-media-query
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport matches a media query
 * 
 * @param query - The media query to check against (e.g. '(min-width: 768px)')
 * @returns Boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize state with the match from window if available (for SSR safety)
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') {
      return;
    }
    
    // Create the media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define listener for changes to the media query
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener to respond to media query changes
    mediaQuery.addEventListener('change', listener);
    
    // Cleanup listener on component unmount
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [query]); // Re-run effect if the query changes

  return matches;
} 