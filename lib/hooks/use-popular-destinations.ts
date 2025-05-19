/**
 * usePopularDestinations Hook
 * 
 * A hook to fetch and manage popular destinations.
 * 
 * @module hooks/use-popular-destinations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * Destination interface
 */
export interface Destination {
  id: string;
  city: string | null;
  country: string | null;
  continent: string;
  description: string | null;
  byline?: string | null;
  highlights?: string[] | string | null;
  image_url?: string | null;
  emoji?: string | null;
  cuisine_rating: number;
  nightlife_rating: number;
  cultural_attractions: number;
  outdoor_activities: number;
  beach_quality: number;
  best_season?: string;
  avg_cost_per_day?: number;
  safety_rating?: number;
  name?: string;
  created_at?: string;
}

/**
 * Hook to fetch popular destinations
 */
export function usePopularDestinations(limit = 8) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/destinations/popular?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch popular destinations: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch destinations');
      setError(errorMessage as Error);
      toast({
        title: 'Error',
        description: errorMessage instanceof Error ? errorMessage.message : 'Failed to load destinations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, toast]);

  // Fetch on component mount
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  return {
    destinations,
    isLoading,
    error,
    refreshDestinations: fetchDestinations,
  };
} 