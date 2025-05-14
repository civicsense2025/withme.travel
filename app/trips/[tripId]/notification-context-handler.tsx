'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface NotificationContextHandlerProps {
  tripId: string;
}

interface HighlightableRef {
  id: string;
  element: HTMLElement | null;
}

export function NotificationContextHandler({ tripId }: NotificationContextHandlerProps) {
  const searchParams = useSearchParams();
  const [highlightedRefs, setHighlightedRefs] = useState<HighlightableRef[]>([]);

  // Register ref function to be exposed to parent component
  const registerHighlightRef = useCallback((id: string, element: HTMLElement | null) => {
    setHighlightedRefs((prev) => {
      // Remove any existing ref with same id
      const filtered = prev.filter((ref) => ref.id !== id);
      // Add the new ref
      return [...filtered, { id, element }];
    });
  }, []);

  // This component doesn't render anything - it just provides context handling
  return null;
}
