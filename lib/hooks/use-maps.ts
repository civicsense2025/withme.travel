// useMaps hook (scaffold)
// React hook for geocoding and directions
import { useState, useCallback } from 'react';
import { geocode, getDirections } from '../client/maps';

export function useMaps() {
  const [results, setResults] = useState<any>(null);
  const [directions, setDirections] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeocode = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await geocode(query);
      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to geocode');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDirections = useCallback(async (origin: [number, number], destination: [number, number]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDirections(origin, destination);
      if (result.success) {
        setDirections(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to get directions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, directions, isLoading, error, fetchGeocode, fetchDirections };
} 