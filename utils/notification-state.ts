// utils/notification-state.ts

interface CountCache {
  count: number;
  timestamp: number;
}

// Use a variable instead of global state to avoid shared references across modules
let unreadCountCache: CountCache | null = null;
const LOCAL_STORAGE_KEY = 'unreadCountCache';
const DEFAULT_TTL = 60000; // 1 minute

/**
 * Gets the unread count from cache, checking localStorage if needed
 */
export function getUnreadCountCache(): CountCache | null {
  if (!unreadCountCache && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) unreadCountCache = JSON.parse(raw);
    } catch (error) {
      console.error('Error reading notification cache:', error);
      return null;
    }
  }
  return unreadCountCache;
}

/**
 * Sets the unread count cache with timestamp
 */
export function setUnreadCountCache(count: number): void {
  try {
    unreadCountCache = { count, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unreadCountCache));
    }
  } catch (error) {
    console.error('Error saving notification cache:', error);
  }
}

/**
 * Checks if the unread count cache is still valid
 */
export function isUnreadCountCacheValid(ttl = DEFAULT_TTL): boolean {
  const cache = getUnreadCountCache();
  return !!cache && (Date.now() - cache.timestamp) < ttl;
}

/**
 * Sets up storage event listener for cross-tab notifications
 * Should be called inside a component with proper cleanup
 */
export function setupStorageListener(callback: (count: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as CountCache;
        unreadCountCache = parsed;
        callback(parsed.count);
      } catch (error) {
        console.error('Error parsing notification cache from storage event:', error);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
} 