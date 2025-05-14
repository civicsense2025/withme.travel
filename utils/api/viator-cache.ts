/**
 * Viator Cache Utility
 *
 * This utility handles caching of Viator API data. According to Viator documentation,
 * destination data should be cached and refreshed weekly.
 */

import path from 'path';
import fs from 'fs';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// Cache directory - we'll store JSON files for cache
const CACHE_DIR = path.join(process.cwd(), '.cache', 'viator');
const DESTINATIONS_CACHE_FILE = path.join(CACHE_DIR, 'destinations.json');
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface CacheMetadata {
  timestamp: number;
  expiresAt: number;
}

interface CacheEntry<T> {
  metadata: CacheMetadata;
  data: T;
}

/**
 * Checks if the cache is valid (exists and not expired)
 */
export function isCacheValid(cacheFile: string): boolean {
  try {
    if (!fs.existsSync(cacheFile)) {
      return false;
    }

    const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
    const cache = JSON.parse(cacheContent) as CacheEntry<unknown>;

    return cache.metadata.expiresAt > Date.now();
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Writes data to cache with metadata
 */
export function writeToCache<T>(cacheFile: string, data: T): void {
  try {
    const now = Date.now();
    const cacheEntry: CacheEntry<T> = {
      metadata: {
        timestamp: now,
        expiresAt: now + CACHE_DURATION_MS,
      },
      data,
    };

    fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
    console.log(`Cache written to ${cacheFile}`);
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Reads data from cache
 */
export function readFromCache<T>(cacheFile: string): T | null {
  try {
    if (!isCacheValid(cacheFile)) {
      return null;
    }

    const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
    const cache = JSON.parse(cacheContent) as CacheEntry<T>;

    return cache.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Get Viator destination ID for a destination
 * Retrieves the viator_destination_id from the database
 */
export async function getViatorDestinationId(destinationId: string): Promise<string | null> {
  try {
    // Get the viator_destination_id from the database
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('destinations')
      .select('viator_destination_id')
      .eq('id', destinationId)
      .single();

    if (error) {
      console.error('Error fetching viator_destination_id:', error);
      return null;
    }

    if (data?.viator_destination_id) {
      return data.viator_destination_id;
    }

    return null;
  } catch (error) {
    console.error('Error in getViatorDestinationId:', error);
    return null;
  }
}

/**
 * Updates the destinations table with Viator destination IDs
 * This should be run periodically to ensure the mapping is up to date
 */
export async function updateViatorDestinationIds(destinations: any[]): Promise<void> {
  try {
    const supabase = await createRouteHandlerClient();

    for (const dest of destinations) {
      if (dest.destinationId && dest.destinationName) {
        // Update the database for any city that matches
        const { error } = await supabase
          .from('destinations')
          .update({ viator_destination_id: dest.destinationId.toString() })
          .eq('city', dest.destinationName)
          .is('viator_destination_id', null); // Only update if not already set

        if (error) {
          console.error(`Error updating Viator ID for ${dest.destinationName}:`, error);
        }
      }
    }

    console.log('Viator destination IDs updated in database');
  } catch (error) {
    console.error('Error updating Viator destination IDs:', error);
  }
}
