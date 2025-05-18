import { useEffect, useState } from 'react';

/**
 * Destination type for popular destinations
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
 * Fetches popular destinations from the API
 * @param limit - Maximum number of destinations to fetch
 * @returns { destinations, loading, error }
 */
export function usePopularDestinations(limit = 8) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/destinations/popular?limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch destinations');
        return res.json();
      })
      .then((data) => {
        setDestinations(data.destinations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  return { destinations, loading, error };
}
