// Service Worker for withme.travel
// Version 1.0.0

const CACHE_NAME = 'withme-cache-v1';

// Assets to precache for offline mode
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/login',
  '/images/withme-logo.png',
  '/images/destination-placeholder.jpg',
  '/favicon.ico'
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  
  // Skip waiting to ensure the latest service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching App Shell');
      // Use Promise.allSettled instead of Promise.all to continue even if some requests fail
      return Promise.allSettled(
        PRECACHE_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              return cache.put(asset, response);
            } else {
              console.warn(`[Service Worker] Failed to cache ${asset}: ${response.status}`);
            }
          } catch (error) {
            console.warn(`[Service Worker] Failed to fetch ${asset} for precaching:`, error);
          }
        })
      );
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  
  // Take control of all clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Helper function to determine if a request is a navigation request
function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept')?.includes('text/html'))
  );
}

// Helper function to determine if we should cache this request
function shouldCache(url) {
  // Cache images, CSS, JS, and fonts
  const cacheableExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf'
  ];
  
  // Don't cache API requests, authentication-related paths, or Supabase requests
  const nonCacheablePaths = [
    '/api/', 
    '/login', 
    '/signup', 
    '/auth/',
    'supabase.co'
  ];
  
  // Check if it's a cacheable extension
  const hasExtension = cacheableExtensions.some(ext => url.pathname.endsWith(ext));
  
  // Check if it's a non-cacheable path
  const isNonCacheable = nonCacheablePaths.some(path => url.toString().includes(path));
  
  return hasExtension && !isNonCacheable;
}

// Fetch event - network first with fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle navigation requests
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If navigation request fails, return the cached homepage or offline page
          return caches.match('/offline') || caches.match('/');
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  if (shouldCache(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          // Still fetch from network to update cache for next time
          fetch(event.request)
            .then((response) => {
              // Update cache if network request was successful
              if (response && response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, response.clone());
                });
              }
            })
            .catch(() => {
              // Ignore network errors for background updates
            });
          
          return cachedResponse;
        }
        
        // If not cached, fetch from network and update cache
        return fetch(event.request).then((response) => {
          if (!response || !response.ok) {
            console.log('[Service Worker] Network request failed, not caching');
            return response;
          }
          
          // Clone response before using it
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          // Return default offline asset for images
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            return caches.match('/images/destination-placeholder.jpg');
          }
          throw error;
        });
      })
    );
    return;
  }
  
  // Network-first strategy for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses for non-auth endpoints
          if (
            response && 
            response.ok && 
            !url.pathname.includes('/api/auth/') &&
            !url.pathname.includes('/api/user/')
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // For failed API requests, try to return cached response
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached API response, throw error
            throw new Error('No offline data available for API request');
          });
        })
    );
    return;
  }
  
  // Default fetch behavior for everything else
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Try to get from cache as fallback
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || Promise.reject('No connectivity and no cached version available');
        });
      })
  );
}); 