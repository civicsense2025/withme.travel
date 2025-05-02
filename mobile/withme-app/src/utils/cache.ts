import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug flag
const DEBUG_MODE = __DEV__;

const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[Cache] ${message}`, data || '');
  }
};

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

// Cache duration in milliseconds (e.g., 1 hour)
const DEFAULT_CACHE_DURATION = 60 * 60 * 1000;

/**
 * Fetches data, using cache if available and not expired.
 * @param key The unique key for this cache entry.
 * @param fetcher A function that fetches fresh data (e.g., from Supabase).
 * @param cacheDuration Optional cache duration in milliseconds. Defaults to 1 hour.
 * @returns The cached or freshly fetched data.
 * @throws If the fetcher function throws an error.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheDuration: number = DEFAULT_CACHE_DURATION
): Promise<T> {
  debugLog(`Attempting to fetch with cache for key: ${key}`);

  // 1. Try to get data from cache
  try {
    const cachedItem = await AsyncStorage.getItem(key);
    if (cachedItem) {
      const entry: CacheEntry<T> = JSON.parse(cachedItem);
      const now = Date.now();

      if (now - entry.timestamp < cacheDuration) {
        debugLog(`Cache hit and valid for key: ${key}`);
        return entry.data;
      } else {
        debugLog(`Cache hit but expired for key: ${key}`);
        // Optionally remove expired item, or let it be overwritten
        // await AsyncStorage.removeItem(key);
      }
    } else {
      debugLog(`Cache miss for key: ${key}`);
    }
  } catch (error) {
    debugLog(`Error reading cache for key ${key}:`, error);
    // Don't prevent fetching, just log the error
  }

  // 2. If cache miss or expired, fetch fresh data
  debugLog(`Fetching fresh data for key: ${key}`);
  const freshData = await fetcher();

  // 3. Store fresh data in cache
  try {
    const newEntry: CacheEntry<T> = {
      timestamp: Date.now(),
      data: freshData,
    };
    await AsyncStorage.setItem(key, JSON.stringify(newEntry));
    debugLog(`Stored fresh data in cache for key: ${key}`);
  } catch (error) {
    debugLog(`Error writing to cache for key ${key}:`, error);
    // Don't throw, just log, as we already have the fresh data
  }

  return freshData;
}

/**
 * Clears a specific cache entry.
 * @param key The key of the cache entry to clear.
 */
export async function clearCacheEntry(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    debugLog(`Cleared cache entry for key: ${key}`);
  } catch (error) {
    debugLog(`Error clearing cache entry for key ${key}:`, error);
  }
}

/**
 * Clears the entire AsyncStorage cache. Use with caution!
 */
export async function clearAllCache(): Promise<void> {
  try {
    await AsyncStorage.clear();
    debugLog('Cleared all cache entries.');
  } catch (error) {
    debugLog('Error clearing all cache entries:', error);
  }
}
