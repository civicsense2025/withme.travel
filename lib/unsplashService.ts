import { createClient } from '@/utils/supabase/client';
import { createApi } from 'unsplash-js';
// Using any for Api type since the module can't be found
import type { Random } from 'unsplash-js/dist/methods/photos/types';
import { UNSPLASH_CONFIG } from '@/utils/constants/api';
import ora from '@/utils/ora';
import chalk from 'chalk';

// Define a basic type for the unsplash API
type Api = any;

// Interface for unsplash image
export interface UnsplashImage {
  id: string;
  url: string;
  alt_description?: string;
  description?: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
}

// Define a utility function for random number generation
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if we have an API key
const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// Initialize Unsplash API client if we have a key
let unsplashApi: Api | null = null;

if (unsplashApiKey) {
  unsplashApi = createApi({
    accessKey: unsplashApiKey,
  });
}

// Travel and landmark keywords to use for random combinations
const TRAVEL_KEYWORDS = [
  'landmark',
  'travel',
  'destination',
  'vacation',
  'tourist',
  'traveler',
  'exploration',
  'wanderlust',
  'skyline',
  'cityscape',
  'adventure',
  'journey',
];

const LANDMARK_KEYWORDS = [
  'monument',
  'architecture',
  'building',
  'historical',
  'famous',
  'iconic',
  'plaza',
  'square',
  'cathedral',
  'temple',
  'palace',
  'museum',
  'castle',
  'bridge',
  'tower',
  'statue',
  'park',
  'garden',
];

const NATURE_KEYWORDS = [
  'mountains',
  'beach',
  'coastline',
  'ocean',
  'sea',
  'landscape',
  'sunset',
  'sunrise',
  'valley',
  'forest',
  'lake',
  'river',
  'waterfall',
  'island',
  'cliff',
  'bay',
  'scenic',
];

/**
 * Get a random travel or landmark keyword to diversify search results
 */
function getRandomKeyword(excludeList: string[] = []): string {
  // Combine all keyword categories
  const allKeywords = [...TRAVEL_KEYWORDS, ...LANDMARK_KEYWORDS, ...NATURE_KEYWORDS];
  
  // Filter out any keywords in the exclude list
  const availableKeywords = allKeywords.filter((keyword) => !excludeList.includes(keyword));
  
  // Select a random keyword
  const randomIndex = random(0, availableKeywords.length - 1);
  return availableKeywords[randomIndex];
}

/**
 * Search Unsplash for images matching the given query
 */
export async function searchUnsplash(query: string, options: {
  page?: number;
  perPage?: number;
  orderBy?: 'latest' | 'relevant';
  orientation?: 'landscape' | 'portrait' | 'squarish';
} = {}) {
  if (!unsplashApi) {
    console.error('Unsplash API key not configured');
    return { 
      error: 'Unsplash API key not configured', 
      results: [] 
    };
  }

  const apiSpinner = ora('Searching Unsplash...').start();

  try {
    // Default options
    const { 
      page = 1, 
      perPage = 30,
      orderBy = 'relevant',
      orientation = 'landscape',
    } = options;

    // Make the API request
    const result = await unsplashApi.search.getPhotos({
      query,
      page,
      perPage,
      orderBy,
      orientation,
    });

    // Handle API errors
    if (result.errors) {
      throw new Error(result.errors[0]);
    }

    apiSpinner.succeed({ text: `Found ${result.response.results.length} Unsplash images` });

    // Return results
    return {
      results: result.response.results,
      total: result.response.total,
      totalPages: result.response.total_pages,
    };
  } catch (error) {
    apiSpinner.error({ text: `Failed to search Unsplash: ${(error as Error).message}` });
    return { error: (error as Error).message, results: [] };
  }
}

/**
 * Get a random Unsplash image for a destination
 */
export async function getRandomDestinationImage(
  city: string,
  state?: string,
  country?: string,
  options: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
  } = {}
) {
  const spinner = ora('Finding Unsplash image for destination...').start();

  try {
    // Generate two unique random keywords to create variety in results
    const randomKeyword1 = getRandomKeyword();
    const uniqueKeyword2 = getRandomKeyword([randomKeyword1]);

    // Build multiple search queries with different combinations
    const searchQueries = [
      `${city} ${state ? state + ' ' : ''}${country} ${randomKeyword1}`,
      `${city} ${country} landmark`,
      `${city} ${state ? state + ' ' : ''}${country} ${uniqueKeyword2}`,
      `${city} tourism`,
      `${city} attraction`,
      `${city} skyline`,
      `${city} sightseeing`,
    ];

    console.log(chalk.dim(`  (Unsplash Query Keywords: ${randomKeyword1}, ${uniqueKeyword2})`));

    // Try each query until we find a result
    for (const query of searchQueries) {
      spinner.text = `Searching Unsplash for "${query}"...`;

      const { results, error } = await searchUnsplash(query, {
        perPage: 30,
        orientation: options.orientation || 'landscape',
      });

      if (error) {
        continue; // Try the next query
      }

      if (results.length > 0) {
        const randomIndex = random(0, Math.min(results.length - 1, 9)); // Pick from top 10 results
        spinner.succeed({ text: `Found Unsplash image using query: ${query}` });
        return {
          success: true,
          image: results[randomIndex],
        };
      }
    }

    // If we get here, we didn't find any images
    spinner.fail({ text: `No Unsplash images found for ${city}, ${country}` });
    return {
      success: false,
      error: `No images found for ${city}, ${country}`,
    };
  } catch (error) {
    spinner.fail({ 
      text: `Error during Unsplash search for "${city}": ${(error as Error).message}`
    });
    
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Get a random destination image using the Unsplash API
 */
export async function getRandomUnsplashImage() {
  // Implementation for random global images
  // ...
}