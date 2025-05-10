'use client';

import { useEffect } from 'react';
import { useResearch } from '@/contexts/research-context';

type EventSources = 'trip' | 'itinerary' | 'profile' | 'budget' | 'navigation';
type EventActions = 'create' | 'update' | 'delete' | 'view' | 'interact';

/**
 * A hook to track research events when specific actions occur
 * 
 * @param source The source of the event (e.g., 'trip', 'itinerary')
 * @param action The action that occurred (e.g., 'create', 'update')
 * @param detail Optional additional details for the event
 * @param dependencies Dependencies that trigger the event when changed
 */
export function useResearchEvent(
  source: EventSources,
  action: EventActions,
  detail?: string,
  dependencies: any[] = []
) {
  const { isResearchSession, trackEvent } = useResearch();
  
  useEffect(() => {
    // Only track events when in research session
    if (!isResearchSession) return;
    
    // Create the event name in a consistent format
    const eventName = `${source}_${action}${detail ? `_${detail}` : ''}`;
    
    // Track the event
    trackEvent(eventName);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
} 