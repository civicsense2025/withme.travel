// useCities hook (scaffold)
// React hook for city search and management
import { useState, useCallback } from 'react';
import { searchCities } from '../client/cities';

export function useCities(initialQuery = '') {
  const [cities, setCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchCities(query);
      if (result.success) {
        setCities(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch cities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { cities, isLoading, error, fetchCities };
} 