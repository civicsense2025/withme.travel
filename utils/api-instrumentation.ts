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
  metadata: Record<string, any> = {}
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `api.${name}`,
    op: 'http.client',
    data: metadata,
  });

  return fn()
    .then((result) => {
      transaction.setStatus('ok');
      transaction.finish();
      return result;
    })
    .catch((error) => {
      transaction.setStatus('error');
      Sentry.captureException(error, {
        tags: {
          apiCall: name,
          ...metadata.tags,
        },
        extra: metadata,
      });
      transaction.finish();
      throw error;
    });
}
