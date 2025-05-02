# Offline Support & Service Worker

## Overview

withme.travel now includes offline support through a service worker implementation, allowing users to continue accessing key parts of the application even without an internet connection. This document outlines how the offline functionality works and how to maintain and extend it.

## Implementation

The offline functionality is implemented through the following components:

1. **Service Worker (`public/sw.js`)**: Caches assets and handles fetch requests
2. **Service Worker Registration (`public/sw-register.js`)**: Registers the service worker and provides online/offline notifications
3. **Offline Page (`app/offline/page.tsx`)**: Provides a user-friendly UI when offline
4. **Offline Notification Component (`components/offline-notification.tsx`)**: Shows a notification banner when offline status is detected

## Caching Strategy

The service worker implements different caching strategies based on the type of request:

1. **Navigation Requests**: Network-first with offline page fallback
2. **Static Assets**: Cache-first with background network update
3. **API Requests**: Network-first with cached fallback for non-sensitive endpoints
4. **Other Requests**: Network-first with cache fallback

## Precached Assets

The following assets are precached for immediate offline availability:

```javascript
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/login',
  '/images/withme-logo.png',
  '/images/destination-placeholder.jpg',
  '/favicon.ico',
];
```

## Offline UX Considerations

1. **Clear Feedback**: The application provides visual cues when offline mode is active through:

   - An offline banner notification
   - UI state changes (via CSS classes `online`/`offline`)
   - Dedicated offline page for failed navigation requests

2. **Graceful Degradation**: Features degrade gracefully when offline:

   - Read-only access to cached trips and content
   - Disabled editing features with clear explanation
   - User actions are queued for processing when back online (when possible)

3. **Data Persistence**: Essential data is stored locally where appropriate:
   - Trip details for currently viewed/recent trips
   - User preferences
   - Partially completed forms (draft saving)

## Security Considerations

1. **Cached Content**: Only public, non-sensitive content is cached. Specifically, we avoid caching:

   - Authentication endpoints (`/api/auth/*`)
   - User-specific API responses (`/api/user/*`)
   - Secure pages that shouldn't be available offline

2. **Authentication**:
   - Auth tokens remain in secure HTTP-only cookies not accessible to the service worker
   - Offline actions requiring authentication display appropriate messaging
   - The service worker never attempts to handle authentication requests

## Service Worker Lifecycle

1. **Installation**: The service worker is installed when a user first visits the site and precaches essential assets.

2. **Activation**: On activation, the service worker:

   - Claims control of all open clients (`self.clients.claim()`)
   - Cleans up old caches to prevent storage bloat
   - Sets up fetch handlers for different request types

3. **Update**: The service worker checks for updates:
   - On page load (via `registration.update()`)
   - Users are notified when updates are available via a notification

## Integration with Application

The service worker integrates with the main application through:

1. **Body Classes**: The `online` and `offline` classes are added to the document body to enable CSS styling based on connection status.

2. **Event Listeners**: The application listens for online/offline events to update UI appropriately.

3. **Update Notification**: A UI component notifies users when a new version of the app is available.

## Testing Offline Functionality

To test offline support:

1. Visit the application in Chrome
2. Open Chrome DevTools
3. Go to the "Application" tab
4. Find "Service Workers" in the left sidebar
5. Check "Offline" to simulate offline mode
6. Navigate through the application to verify offline behavior

## Extending Offline Support

To expand offline capabilities:

1. **Add to Precache List**: Include new critical assets in the `PRECACHE_ASSETS` array.

2. **Adjust Caching Logic**: Modify the `shouldCache` function to include additional file types or paths.

3. **Enhanced Offline UI**: Improve the offline experience with more detailed feedback and options.

4. **Background Sync**: Implement the Background Sync API for deferred operations when back online.

5. **Indexed DB**: Use IndexedDB for more complex offline data persistence.

## Troubleshooting

Common issues and solutions:

1. **Service Worker Not Updating**:

   - Check if the service worker file has changed (browsers compare byte-by-byte)
   - Force update with `registration.update()` or increment the cache version

2. **Unexpected Caching Behavior**:

   - Review the `shouldCache` function to ensure correct logic
   - Check the Network tab in DevTools to see if requests are being intercepted

3. **Offline Page Not Showing**:
   - Verify the offline page is properly precached
   - Check navigation request handling in the fetch event

## Implementation Summary

Our offline support:

- Provides critical functionality even without an internet connection
- Balances performance through smart caching strategies
- Maintains security by not caching sensitive information
- Creates a seamless user experience with clear feedback
- Properly handles service worker updates
