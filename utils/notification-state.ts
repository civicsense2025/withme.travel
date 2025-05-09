// utils/notification-state.ts

interface CountCache {
  count: number;
  timestamp: number;
}

let unreadCountCache: CountCache | null = null;
const LOCAL_STORAGE_KEY = 'unreadCountCache';
const DEFAULT_TTL = 60000; // 1 minute

export function getUnreadCountCache(): CountCache | null {
  if (!unreadCountCache && typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) unreadCountCache = JSON.parse(raw);
  }
  return unreadCountCache;
}

export function setUnreadCountCache(count: number): void {
  unreadCountCache = { count, timestamp: Date.now() };
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unreadCountCache));
  }
}

export function isUnreadCountCacheValid(ttl = DEFAULT_TTL): boolean {
  const cache = getUnreadCountCache();
  return !!cache && (Date.now() - cache.timestamp) < ttl;
}

// Listen for cross-tab updates
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
      unreadCountCache = JSON.parse(event.newValue);
    }
  });
} 