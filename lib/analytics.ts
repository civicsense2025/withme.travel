/**
 * Analytics utility to track user events in the application
 */

// Define event categories for better organization
export const EVENT_CATEGORY = {
  IDEA_BOARD: 'idea_board',
  VOTING: 'voting',
  TRIP_CREATION: 'trip_creation',
  COLLABORATION: 'collaboration',
  NAVIGATION: 'navigation',
  USER: 'user',
  CONTENT: 'content',
};

// Define specific event names for consistency
export const EVENT_NAME = {
  // Idea Board Events
  IDEA_CREATED: 'idea_created',
  IDEA_EDITED: 'idea_edited',
  IDEA_DELETED: 'idea_deleted',
  IDEA_MOVED: 'idea_moved',
  IDEA_REORDERED: 'idea_reordered',
  VOTING_STARTED: 'voting_started',
  BOARD_EXPORTED: 'board_exported',
  COLUMN_TOGGLED: 'column_toggled',
  KEYBOARD_SHORTCUT_USED: 'keyboard_shortcut_used',
  DIALOG_OPENED: 'dialog_opened',
  DIALOG_CLOSED: 'dialog_closed',

  // Voting Events
  VOTE_CAST: 'vote_cast',
  VOTE_CHANGED: 'vote_changed',
  VOTING_COMPLETED: 'voting_completed',

  // Trip Creation Events
  TRIP_CREATED: 'trip_created',
  TRIP_EDITED: 'trip_edited',

  // Collaboration Events
  USER_PRESENCE_CHANGED: 'user_presence_changed',
  COLLABORATOR_LIST_VIEWED: 'collaborator_list_viewed',

  // Navigation Events
  PAGE_VIEWED: 'page_viewed',

  // User Events
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',

  // Content Events
  CONTENT_VIEWED: 'content_viewed',
};

// Define interface for event properties
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Track an event in the analytics system
 *
 * @param eventName The name of the event
 * @param category The category of the event
 * @param properties Additional properties for the event
 */
export const trackEvent = (eventName: string, category: string, properties?: EventProperties) => {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ANALYTICS: [${category}] ${eventName}`, properties);
  }

  // Send to analytics API
  try {
    fetch('/api/analytics/custom-metric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: eventName,
        category,
        value: 1,
        properties: {
          timestamp: new Date().toISOString(),
          pathname: typeof window !== 'undefined' ? window.location.pathname : '',
          ...properties,
        },
      }),
    }).catch((err) => console.error('Analytics error:', err));
  } catch (error) {
    console.error('Error sending analytics:', error);
  }

  // If you have Vercel Analytics, also send there
  try {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', eventName, {
        category,
        ...properties,
      });
    }
  } catch (e) {
    console.error('Vercel Analytics error:', e);
  }
};

/**
 * Track a page view
 *
 * @param pageName The name of the page
 * @param properties Additional properties for the page view
 */
export const trackPageView = (pageName: string, properties?: EventProperties) => {
  trackEvent(EVENT_NAME.PAGE_VIEWED, EVENT_CATEGORY.NAVIGATION, {
    page_name: pageName,
    ...properties,
  });
};

/**
 * Initialize analytics for a specific page
 *
 * @param pageName The name of the page
 */
export const initPageAnalytics = (pageName: string) => {
  if (typeof window === 'undefined') return;

  // Track initial page view
  trackPageView(pageName);

  // Setup error tracking
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    trackEvent('error_occurred', 'error', {
      message: String(message),
      source,
      lineno,
      colno,
      stack: error?.stack,
    });

    // Call original handler if exists
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
};

/**
 * Analytics hook to track events in a component
 *
 * @param category The category of events for this component
 * @param componentName Optional component name
 */
export const useAnalytics = (category: string, componentName?: string) => {
  return {
    trackEvent: (eventName: string, properties?: EventProperties) => {
      trackEvent(eventName, category, {
        component: componentName,
        ...properties,
      });
    },
  };
};

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

// Add Window interface augmentation for TypeScript
declare global {
  interface Window {
    analytics?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
  }
}
