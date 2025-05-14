import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import {
  isCacheValid,
  readFromCache,
  writeToCache,
  updateViatorDestinationIds,
} from '@/utils/api/viator-cache';

// Cache file path for destinations
const DESTINATIONS_CACHE_FILE = path.join(process.cwd(), '.cache', 'viator', 'destinations.json');

/**
 * GET handler for Viator destination taxonomy
 * This endpoint fetches the destination taxonomy from Viator's API
 * and returns all available destinations.
 *
 * The response can be used to map your internal destination IDs
 * to Viator's destination IDs.
 *
 * Follows Viator's recommendation to cache taxonomy data and refresh weekly.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Handling request for Viator destination taxonomy');

    // Try to get data from cache first
    if (isCacheValid(DESTINATIONS_CACHE_FILE)) {
      console.log('Using cached Viator destination taxonomy data');
      const cachedData = readFromCache<any>(DESTINATIONS_CACHE_FILE);

      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          totalCount: cachedData.length,
          source: 'cache',
        });
      }
    }

    console.log('Cache not valid, fetching fresh Viator destination taxonomy');

    const apiKey = process.env.VIATOR_API_KEY;

    if (!apiKey) {
      console.error('VIATOR_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured',
        },
        { status: 500 }
      );
    }

    // Call Viator's taxonomy/destinations endpoint to get all destinations
    const response = await fetch('https://api.viator.com/partner/v1/taxonomy/destinations', {
      headers: {
        Accept: 'application/json',
        'exp-api-key': apiKey,
      },
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
      } catch (e) {
        errorDetails = await response.text();
      }

      console.error(`Viator API error response for destinations: ${errorDetails}`);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch Viator destinations: ${response.status}`,
          details: errorDetails,
        },
        { status: 500 }
      );
    }

    const apiResponse = await response.json();
    const destinationsData = apiResponse.data || [];

    // Cache the destinations data
    if (destinationsData.length > 0) {
      console.log(`Caching ${destinationsData.length} Viator destinations`);
      writeToCache(DESTINATIONS_CACHE_FILE, destinationsData);

      // Update destination IDs in database in the background
      // This won't block the response
      updateViatorDestinationIds(destinationsData).catch((error) => {
        console.error('Error updating destination IDs:', error);
      });
    }

    // Return the destinations data
    return NextResponse.json({
      success: true,
      data: destinationsData,
      totalCount: destinationsData.length,
      source: 'api',
    });
  } catch (error: any) {
    console.error('Error fetching Viator destination taxonomy:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Viator destinations',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
