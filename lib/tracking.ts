/**
 * Tracking utility functions for analytics events
 */

/**
 * Track an event with the analytics provider
 *
 * @param eventName The name of the event to track
 * @param properties Additional properties to include with the event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Log the event to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties);
  }

  // Send the event to the analytics provider
  try {
    // Check if window is defined (client-side only)
    if (typeof window !== 'undefined') {
      // Send to Segment/Amplitude/etc if configured
      if (window.analytics?.track) {
        window.analytics.track(eventName, properties);
      }

      // Send to Google Analytics if configured
      if (window.gtag) {
        window.gtag('event', eventName, properties);
      }

      // Send to Plunk Analytics if configured
      sendPlunkAnalytics(eventName, properties);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track server-side events (in API routes)
 * This is a special version for server-side tracking
 */
export function trackServerEvent(eventName: string, properties?: Record<string, any>) {
  // Log the event to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Server Analytics] ${eventName}`, properties);
  }

  // In a real implementation, you'd send this to your analytics backend
  // For now, we'll just log it
}

/**
 * Send analytics data to Plunk
 */
async function sendPlunkAnalytics(eventName: string, properties?: Record<string, any>) {
  const plunkApiKey = process.env.NEXT_PUBLIC_PLUNK_API_KEY;

  if (!plunkApiKey) return;

  try {
    // This is a simplified implementation
    // In a real-world scenario, you would batch events and respect rate limits
    await fetch('https://api.useplunk.com/v1/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${plunkApiKey}`,
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error sending analytics to Plunk:', error);
  }
}

// Add TypeScript type definitions for window
declare global {
  interface Window {
    analytics?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
  }
}
