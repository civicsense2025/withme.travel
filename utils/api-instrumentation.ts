import * as Sentry from '@sentry/nextjs';

/**
 * Utility function to instrument API calls with Sentry monitoring
 * @param fn The async function to execute and monitor
 * @param name Name of the API call for tracking
 * @param metadata Additional metadata to include with the transaction
 * @returns The result of the function call
 */
export function instrumentApiCall<T>(
  fn: () => Promise<T>,
  name: string,
  metadata: Record<string, unknown> = {}
): Promise<T> {
  const apiCallStart = Date.now();
  
  return fn()
    .then((result) => {
      // No transaction, just return the result
      return result;
    })
    .catch((error) => {
      // Calculate duration for the failed call
      const duration = Date.now() - apiCallStart;
      
      // Extract tags safely with proper typing
      const tags: Record<string, string> = { 
        apiCall: name,
        duration: String(duration)
      };
      
      // Add any string tags from metadata
      if (metadata.tags && typeof metadata.tags === 'object' && metadata.tags !== null) {
        Object.entries(metadata.tags as Record<string, unknown>).forEach(([key, value]) => {
          if (typeof value === 'string') {
            tags[key] = value;
          }
        });
      }
      
      // Capture the exception with Sentry
      Sentry.captureException(error, {
        tags,
        extra: {
          ...metadata,
          duration
        },
      });
      
      // Rethrow the error
      throw error;
    });
}