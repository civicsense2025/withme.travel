import OpenReplay from '@openreplay/tracker';

// This is a placeholder - you'll replace this with your actual project key from OpenReplay dashboard
const PROJECT_KEY = process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY || 'O4mkxXSf3mXPdYQKpTdP';

// Initialize OpenReplay and get the tracker instance
export function initOpenReplay() {
  if (typeof window === 'undefined') return null;

  // Check if OpenReplay is already initialized somewhere else
  if (window.__OPENREPLAY__) {
    return window.__OPENREPLAY__;
  }

  try {
    const tracker = new OpenReplay({
      projectKey: PROJECT_KEY,
      // Only run tracker in production for best performance
      __DISABLE_SECURE_MODE: process.env.NODE_ENV !== 'production',
    });

    // Store globally to prevent multiple initialization
    window.__OPENREPLAY__ = tracker;
    return tracker;
  } catch (error) {
    console.error('Failed to initialize OpenReplay:', error);
    return null;
  }
}

// Use this to start tracking (call from client components)
export function startOpenReplay() {
  try {
    const trackerInstance = initOpenReplay();

    // Start tracker if we have an instance
    if (trackerInstance) {
      trackerInstance.start();
    }

    return trackerInstance;
  } catch (error) {
    console.error('Error starting OpenReplay:', error);
    return null;
  }
}

// Get the current tracker instance
export function getTracker() {
  if (typeof window === 'undefined') return null;
  return window.__OPENREPLAY__ || null;
}

// Identify user for better session tracking
export function identifyUser(userId: string, userInfo?: Record<string, any>) {
  try {
    const trackerInstance = getTracker();
    if (!trackerInstance) return;

    // Set the user ID for session attribution
    trackerInstance.setUserID(userId);

    // Add additional user metadata if provided
    if (userInfo) {
      Object.entries(userInfo).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          trackerInstance.setMetadata(key, String(value));
        }
      });
    }
  } catch (error) {
    console.error('Error identifying user in OpenReplay:', error);
  }
}

// Add type definition for the global window object
declare global {
  interface Window {
    __OPENREPLAY__?: InstanceType<typeof OpenReplay>;
  }
}
