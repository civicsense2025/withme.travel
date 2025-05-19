import { useState, useCallback } from 'react';
import { exportTripCalendar } from '@/lib/client/trips';

interface ExportResult {
  downloadUrl: string;
  expiresAt: string;
}

interface UseExportCalendarReturn {
  /**
   * Function to export the trip itinerary to a calendar format
   * @param options - Export configuration (format, timezone, etc.)
   * @returns Promise with the export result or null if failed
   */
  exportCalendar: (
    options: {
      format: 'ics' | 'google';
      includeAllEvents?: boolean;
      timezone?: string;
    }
  ) => Promise<ExportResult | null>;
  /** Whether the export is in progress */
  isLoading: boolean;
  /** Error object if the export failed */
  error: Error | null;
  /** The last successful export result */
  data: ExportResult | null;
  /** Resets the hook state */
  reset: () => void;
}

/**
 * Hook for exporting trip itineraries to calendar formats (ICS/Google Calendar)
 * @param tripId - The ID of the trip to export
 * @returns Object with export function and state management
 */
export function useExportCalendar(tripId: string): UseExportCalendarReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ExportResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  const exportCalendar = useCallback(
    async (options: {
      format: 'ics' | 'google';
      includeAllEvents?: boolean;
      timezone?: string;
    }): Promise<ExportResult | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await exportTripCalendar(tripId, options);
        
        if (!result.success) {
          throw new Error(result.error);
        }

        setData(result.data);
        return result.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Calendar export failed');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [tripId]
  );

  return { exportCalendar, isLoading, error, data, reset };
} 