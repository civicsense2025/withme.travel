import { useState, useCallback } from 'react';
import { thumbnails } from '../client/images';
import type { ThumbnailOptions } from '../api/images';

export function useThumbnail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateThumbnail = useCallback(
    async (type: 'destination' | 'trip', id: string, options: ThumbnailOptions) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = type === 'destination'
          ? await thumbnails.generateForDestination({
              ...options,
              title: options.title || 'Destination',
            })
          : await thumbnails.generateForTrip({
              ...options,
              title: options.title || 'Trip',
            });
        
        if (!result.success) throw new Error(result.error);
        return result.data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Thumbnail generation failed'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { generateThumbnail, isLoading, error };
} 