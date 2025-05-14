import plunk from './plunk';

interface PlunkEventPayload {
  email: string;
  name?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Sends a Plunk event by name and payload. Also creates/updates the contact with optional metadata for segmentation.
 * Uses plunk.events.track, which creates the contact if it doesn't exist.
 * If the first call fails, retries with only required fields as a fallback.
 * See: https://docs.useplunk.com/api-reference/base-url and https://docs.useplunk.com/working-with-contacts/segmentation
 */
export default async function sendPlunkEvent(
  eventName: string,
  payload: PlunkEventPayload
): Promise<void> {
  try {
    // Compose data for segmentation (Plunk uses 'data' for metadata)
    const data: Record<string, any> = { ...payload.metadata };
    if (payload.name) data.name = payload.name;

    await plunk.events.track({
      event: eventName,
      email: payload.email,
      data,
    });
  } catch (error) {
    console.error('Error sending Plunk event (full payload):', error);
    // Fallback: try again with only required fields
    try {
      await plunk.events.track({
        event: eventName,
        email: payload.email,
      });
    } catch (fallbackError) {
      console.error('Plunk fallback also failed:', fallbackError);
    }
  }
}
