'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTrip } from '@/lib/client/trips';
import { isSuccess } from '@/lib/client/result';
import { Trip } from '@/lib/client/trips';

interface TripContextType {
  trip: Trip | null;
  loading: boolean;
  error: string | null;
  refreshTrip: () => Promise<void>;
}

const TripContext = createContext<TripContextType>({
  trip: null,
  loading: false,
  error: null,
  refreshTrip: async () => {}
});

export const useTripContext = () => useContext(TripContext);

interface TripProviderProps {
  tripId: string;
  initialTrip?: Trip | null;
  children: React.ReactNode;
}

export function TripProvider({ tripId, initialTrip = null, children }: TripProviderProps) {
  const [trip, setTrip] = useState<Trip | null>(initialTrip);
  const [loading, setLoading] = useState<boolean>(!initialTrip);
  const [error, setError] = useState<string | null>(null);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getTrip(tripId);
      
      if (isSuccess(result)) {
        setTrip(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTrip) {
      fetchTrip();
    }
  }, [tripId, initialTrip]);

  const refreshTrip = async () => {
    await fetchTrip();
  };

  return (
    <TripContext.Provider value={{ trip, loading, error, refreshTrip }}>
      {children}
    </TripContext.Provider>
  );
} 