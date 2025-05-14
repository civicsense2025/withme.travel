/**
 * Utility functions for managing localStorage with expiry (TTL)
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

/**
 * Set an item in localStorage with an expiry time
 *
 * @param key - The localStorage key
 * @param value - The value to store
 * @param ttl - Time to live in milliseconds
 */
export function setWithExpiry<T>(key: string, value: T, ttl: number): void {
  const item: CacheItem<T> = {
    value,
    expiry: Date.now() + ttl,
  };

  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting localStorage item with expiry:', error);
    // Handle localStorage errors (e.g., quota exceeded)
    try {
      // Try to clean up expired items first
      cleanExpiredItems();
      // Try again
      localStorage.setItem(key, JSON.stringify(item));
    } catch (retryError) {
      // If still failing, can't store the item
      console.error('Error setting localStorage item after cleanup:', retryError);
    }
  }
}

/**
 * Get an item from localStorage, returns null if expired or not found
 *
 * @param key - The localStorage key
 * @returns The stored value or null if expired/not found
 */
export function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item: CacheItem<T> = JSON.parse(itemStr);

    // Check if the item is expired
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error('Error parsing localStorage item:', error);
    return null;
  }
}

/**
 * Update the expiry of an existing item without changing its value
 *
 * @param key - The localStorage key
 * @param ttl - New time to live in milliseconds
 * @returns true if successful, false if item doesn't exist
 */
export function updateExpiry(key: string, ttl: number): boolean {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return false;

  try {
    const item = JSON.parse(itemStr);
    item.expiry = Date.now() + ttl;
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Error updating expiry:', error);
    return false;
  }
}

/**
 * Clean up all expired items from localStorage
 */
export function cleanExpiredItems(): void {
  const now = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const itemStr = localStorage.getItem(key);
    if (!itemStr) continue;

    try {
      const item = JSON.parse(itemStr);
      if (item && typeof item === 'object' && 'expiry' in item) {
        if (now > item.expiry) {
          localStorage.removeItem(key);
          i--; // Adjust index since we removed an item
        }
      }
    } catch (error) {
      // Skip items that aren't valid JSON or don't have expiry
      continue;
    }
  }
}

/**
 * Get the remaining TTL (in milliseconds) for a cached item
 *
 * @param key - The localStorage key
 * @returns Remaining time in milliseconds, 0 if expired/not found
 */
export function getRemainingTTL(key: string): number {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return 0;

  try {
    const item = JSON.parse(itemStr);
    const remaining = item.expiry - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Initialize cache cleaner to run periodically
 * @param intervalMs How often to clean expired items (default: 30 minutes)
 */
export function initCacheCleaner(intervalMs = 30 * 60 * 1000): () => void {
  // Clean on init
  cleanExpiredItems();

  // Set up interval
  const intervalId = setInterval(cleanExpiredItems, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
