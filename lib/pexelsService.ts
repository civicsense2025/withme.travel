import fetch from 'node-fetch';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import dotenv from 'dotenv';

// --- Types / Interfaces ---
export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string; // Link to Pexels page
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string | null;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}
// --- End Types / Interfaces ---

// Load environment variables
dotenv.config({ path: '.env.local' });

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
  console.error(chalk.red('Error: PEXELS_API_KEY not found in environment variables. Ensure it is set in .env.local'));
  // throw new Error('PEXELS_API_KEY is not configured.');
}

// Basic delay to avoid hitting rapid limits (Pexels limit is often per hour/month)
const PEXELS_REQUEST_DELAY = 200; // ms delay between Pexels API calls

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Keyword Sets for Queries (Can be the same or different from Unsplash) ---
const pexelsPrimaryKeywords = [
  'landmark', 'cityscape', 'skyline', 'architecture', 'travel spot', 'downtown'
];
const pexelsSecondaryKeywords = [
  'scenic', 'nature', 'travel', 'tourism', 'viewpoint', 'people travel' // Pexels often has good lifestyle/people shots
];

// Helper function to get random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
// --- End Keyword Sets ---

// --- Pexels API Functions ---

/**
 * Searches Pexels for photos based on a query.
 */
export async function searchPexelsPhotos(
  query: string,
  page = 1,
  perPage = 5 // Fetch a few results for random selection
): Promise<PexelsSearchResponse> {
  if (!PEXELS_API_KEY) {
      throw new Error("PEXELS_API_KEY is not configured. Cannot search photos.");
  }
  await delay(PEXELS_REQUEST_DELAY); // Simple delay before each request
  const apiSpinner = createSpinner(`Searching Pexels API for "${query}"...`).start();

  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.append('query', query);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('per_page', perPage.toString());
  url.searchParams.append('orientation', 'landscape');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      let errorDetails = response.statusText;
      try {
          // Try to parse error details from Pexels response body
          const errorData: any = await response.json(); 
          if (typeof errorData === 'object' && errorData !== null) {
              errorDetails = errorData?.error || errorData?.code || errorDetails;
          }
      } catch (parseError) { 
          // If parsing fails, just use the status text
          console.warn(`Could not parse error response body for Pexels API error ${response.status}`);
      }
      apiSpinner.error({ text: `Pexels API Error: ${response.status} ${errorDetails}` });
      throw new Error(`Pexels API Error (${response.status}): ${errorDetails}`);
    }

    const data = await response.json() as PexelsSearchResponse;
    apiSpinner.success({ text: `Found ${data.total_results} Pexels results for "${query}"` });
    return data;
  } catch (error) {
    apiSpinner.error({ text: `Failed to search Pexels: ${(error as Error).message}` });
    throw error;
  }
}

/**
 * Gets the best photo for a destination from Pexels, trying multiple queries
 * with randomized keywords. Selects randomly from the top results.
 */
export async function getPexelsDestinationPhoto(
  city: string,
  country: string,
  state: string | null,
): Promise<{ photo: PexelsPhoto, attribution: string, sourceQuery: string, attributionHtml: string } | null> {
   if (!PEXELS_API_KEY) {
      console.warn(chalk.yellow("PEXELS_API_KEY is not configured. Skipping Pexels search."));
      return null;
  }

  // --- Dynamic Query Generation ---
  const randomKeyword1 = getRandomElement(pexelsPrimaryKeywords);
  const randomKeyword2 = getRandomElement(pexelsSecondaryKeywords);
  const uniqueKeyword2 = randomKeyword2 !== randomKeyword1 ? randomKeyword2 : getRandomElement(pexelsSecondaryKeywords.filter(k => k !== randomKeyword1));

  const queries = [
    `${city} ${state ? state + ' ' : ''}${country} ${randomKeyword1}`,
    `${city} ${country} ${randomKeyword1}`,
    `${city} ${state ? state + ' ' : ''}${country} ${uniqueKeyword2}`,
    `${city} ${country} ${uniqueKeyword2}`,
    `${country} ${randomKeyword1}`,
    `${country} ${uniqueKeyword2}`,
    // `${city} ${country}` // Optional fallback
  ];
  console.log(chalk.dim(`  (Pexels Query Keywords: ${randomKeyword1}, ${uniqueKeyword2})`));
  // --- End Dynamic Query Generation ---

  for (const query of queries) {
    const spinner = createSpinner(`Attempting Pexels search with query: "${query}"`).start();
    try {
      const response = await searchPexelsPhotos(query, 1, 5);

      if (response.photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.photos.length);
        const photo = response.photos[randomIndex];
        spinner.success({ text: `Found Pexels image using query: "${query}"` });

        // Plain text attribution (keeping for backward compatibility)
        const textAttribution = `Photo by ${photo.photographer} on Pexels (${photo.photographer_url})`;
        
        // HTML attribution with proper hyperlinks
        const attributionHtml = `Photo by <a href="${photo.photographer_url}" target="_blank" rel="noopener noreferrer">${photo.photographer}</a> on <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>`;

        return {
          photo,
          attribution: textAttribution,
          sourceQuery: query,
          attributionHtml,
        };
      }
      spinner.warn({ text: `No Pexels results for query: "${query}"` });
    } catch (error) {
       spinner.error({ text: `Error during Pexels search for "${query}": ${(error as Error).message}` });
       // Allow loop to continue to next query
    }
  }

  console.warn(chalk.yellow(`Could not find any suitable Pexels image for ${city}, ${country} after trying multiple random queries.`));
  return null; 
} 