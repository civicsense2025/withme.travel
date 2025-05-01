import { API_ROUTES } from '@/utils/constants/routes';
('use client');

import { useEffect, useState } from 'react';
export interface Trip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const response = await fetch(API_ROUTES.TRIPS);
        if (!response.ok) {
          throw new Error('Failed to fetch trips');
        }
        const data = await response.json();
        setTrips(data.trips || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trips'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrips();
  }, []);

  return { trips, isLoading, error };
}
