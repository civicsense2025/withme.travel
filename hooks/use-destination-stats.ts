'use client';

import { useState, useEffect } from 'react';

interface DestinationStats {
  local_language?: string;
  visa_required?: boolean;
  lgbtq_friendliness?: number;
  accessibility?: number;
  high_season?: string;
  recommended_currencies?: string;
  time_zone_offset?: number;
  description?: string;
  destinations_count?: number;
  countries_count?: number;
  avg_safety_rating?: number;
  avg_cost_per_day?: number;
  [key: string]: any;
}

interface UseDestinationStatsProps {
  type: 'country' | 'continent';
  name: string;
}

interface UseDestinationStatsResult {
  stats: DestinationStats;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch aggregated stats for a country or continent
 */
export function useDestinationStats({
  type,
  name,
}: UseDestinationStatsProps): UseDestinationStatsResult {
  const [stats, setStats] = useState<DestinationStats>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!name) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const endpoint =
          type === 'country'
            ? `/api/destinations/countries/${encodeURIComponent(name)}/stats`
            : `/api/destinations/continents/${encodeURIComponent(name)}/stats`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to load ${type} stats: ${response.status}`);
        }

        const data = await response.json();
        setStats(data.stats || {});
      } catch (err) {
        console.error(`Error fetching ${type} stats:`, err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [type, name]);

  return { stats, isLoading, error };
}
