import fetch from 'node-fetch';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import dotenv from 'dotenv';

// --- Types / Interfaces ---
export interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
    };
  };
  tags?: { title: string }[];
  width?: number;
  height?: number;
  color?: string;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}
// --- End Types / Interfaces ---

// Load environment variables
// Ensure this path works correctly relative to where the process is run from
// Using process.cwd() might be more robust if scripts run from different locations
dotenv.config({ path: '.env.local' });

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
  console.error(
    chalk.red(
      'Error: UNSPLASH_ACCESS_KEY not found in environment variables. Ensure it is set in .env.local'
    )
  );
  // Throw an error or handle appropriately for service context
  // Avoid process.exit(1) in library code
  // throw new Error('UNSPLASH_ACCESS_KEY is not configured.');
}

// Rate Limiting Configuration (shared state for this service instance)
const DEFAULT_RATE_LIMIT = 50; // Unsplash default limit per hour
let requestCount = 0;
let rateLimit = DEFAULT_RATE_LIMIT; // Can be made configurable if needed
let lastRequestTime = Date.now(); // Track start of current hour window

// Helper for rate limiting
async function applyRateLimit() {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn(
      chalk.yellow(
        'Skipping rate limit check as UNSPLASH_ACCESS_KEY is missing. API calls will likely fail.'
      )
    );
    return; // Don't proceed if key is missing
  }

  const now = Date.now();
  // Reset count if more than an hour has passed since the window started
  if (now - lastRequestTime > 3600000) {
    requestCount = 0;
    lastRequestTime = now; // Start new window
  }

  if (requestCount >= rateLimit) {
    const waitTime = lastRequestTime + 3600000 - now; // Time until the hour window ends
    if (waitTime > 0) {
      console.log(
        chalk.yellow(
          `Unsplash API rate limit reached (${rateLimit}/hour). Waiting ${(waitTime / 1000 / 60).toFixed(1)} minutes...`
        )
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      requestCount = 0; // Reset count after waiting
      lastRequestTime = Date.now(); // Start new window immediately
    } else {
      // If waitTime is negative, the hour has already passed, just reset
      requestCount = 0;
      lastRequestTime = now;
    }
  }

  requestCount++;
  // console.log(chalk.dim(`API Request ${requestCount}/${rateLimit} for this hour.`));
}

// --- Keyword Sets for Queries ---
const primaryKeywords = ['landmark', 'cityscape', 'skyline', 'architecture', 'downtown', 'iconic'];
const secondaryKeywords = ['scenic', 'nature', 'travel', 'tourism', 'viewpoint', 'building'];

// Helper function to get random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
// --- End Keyword Sets ---

// --- Unsplash API Functions ---

/**
 * Searches Unsplash for photos based on a query.
 */
export async function searchUnsplashPhotos(
  query: string,
  page = 1,
  perPage = 5 // Default to fetching 5 for random selection
): Promise<UnsplashSearchResponse> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY is not configured. Cannot search photos.');
  }
  await applyRateLimit();
  const apiSpinner = createSpinner(`Searching Unsplash API for "${query}"...`).start();

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.append('query', query);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('per_page', perPage.toString()); // Use perPage parameter
  url.searchParams.append('orientation', 'landscape');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      let errorDetails = response.statusText;
      try {
        const errorData: any = await response.json();
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          errorDetails = String(errorData.errors[0]);
        }
      } catch (parseError) {
        /* Ignore */
      }
      apiSpinner.error({ text: `Unsplash API Error: ${response.status} ${response.statusText}` });
      throw new Error(`API Error (${response.status}): ${errorDetails}`);
    }

    const data = (await response.json()) as UnsplashSearchResponse;
    apiSpinner.success({ text: `Found ${data.total} results for "${query}"` });
    return data;
  } catch (error) {
    apiSpinner.error({ text: `Failed to search Unsplash: ${(error as Error).message}` });
    throw error;
  }
}

/**
 * Gets the best photo for a destination from Unsplash, trying multiple queries
 * with randomized keywords. Selects randomly from the top results.
 */
export async function getDestinationPhoto(
  city: string,
  country: string,
  state: string | null
): Promise<{
  photo: UnsplashPhoto;
  attribution: string;
  sourceQuery: string;
  attributionHtml: string;
} | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn(chalk.yellow('UNSPLASH_ACCESS_KEY is not configured. Skipping Unsplash search.'));
    return null;
  }

  // --- Dynamic Query Generation ---
  const randomKeyword1 = getRandomElement(primaryKeywords);
  const randomKeyword2 = getRandomElement(secondaryKeywords);
  // Ensure keywords are different if possible
  const uniqueKeyword2 =
    randomKeyword2 !== randomKeyword1
      ? randomKeyword2
      : getRandomElement(secondaryKeywords.filter((k) => k !== randomKeyword1));

  const queries = [
    // Try more specific queries first with random keywords
    `${city} ${state ? state + ' ' : ''}${country} ${randomKeyword1}`,
    `${city} ${country} ${randomKeyword1}`,
    // Try with the secondary keyword
    `${city} ${state ? state + ' ' : ''}${country} ${uniqueKeyword2}`,
    `${city} ${country} ${uniqueKeyword2}`,
    // Fallback to just country + keyword
    `${country} ${randomKeyword1}`,
    `${country} ${uniqueKeyword2}`,
    // Absolute fallback (optional)
    // `${city} ${country}`
  ];
  console.log(chalk.dim(`  (Unsplash Query Keywords: ${randomKeyword1}, ${uniqueKeyword2})`));
  // --- End Dynamic Query Generation ---

  for (const query of queries) {
    const spinner = createSpinner(`Attempting Unsplash search with query: "${query}"`).start();
    try {
      const response = await searchUnsplashPhotos(query, 1, 5);

      if (response.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.results.length);
        const photo = response.results[randomIndex];
        spinner.success({ text: `Found Unsplash image using query: "${query}"` });

        const attributionLink = (url: string) =>
          `${url}?utm_source=withme.travel&utm_medium=referral`;
        const userUrl = attributionLink(photo.user.links.html);
        const unsplashUrl = attributionLink('https://unsplash.com');

        // Plain text attribution (keeping for backward compatibility)
        const textAttribution = `Photo by ${photo.user.name} (${userUrl}) on Unsplash (${unsplashUrl})`;

        // HTML attribution with proper hyperlinks
        const attributionHtml = `Photo by <a href="${userUrl}" target="_blank" rel="noopener noreferrer">${photo.user.name}</a> on <a href="${unsplashUrl}" target="_blank" rel="noopener noreferrer">Unsplash</a>`;

        return {
          photo,
          attribution: textAttribution,
          sourceQuery: query,
          attributionHtml,
        };
      }
      spinner.warn({ text: `No Unsplash results for query: "${query}"` });
    } catch (error) {
      spinner.error({
        text: `Error during Unsplash search for "${query}": ${(error as Error).message}`,
      });
    }
  }

  console.warn(
    chalk.yellow(
      `Could not find any suitable Unsplash image for ${city}, ${country} after trying multiple random queries.`
    )
  );
  return null;
}

/**
 * Triggers the download tracking endpoint on Unsplash.
 * IMPORTANT: Call this *before* initiating the actual image download.
 */
export async function trackUnsplashDownload(photo: UnsplashPhoto): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn(
      chalk.yellow('Skipping Unsplash download tracking as UNSPLASH_ACCESS_KEY is missing.')
    );
    return; // Don't proceed if key is missing
  }
  if (!photo?.links?.download_location) {
    console.warn(
      chalk.yellow(
        `Photo object missing download_location link. Cannot track download for photo ID: ${photo?.id}`
      )
    );
    return;
  }

  const trackSpinner = createSpinner(
    `Tracking Unsplash download for photo ID: ${photo.id}...`
  ).start();
  try {
    await applyRateLimit(); // Count tracking as an API interaction
    const response = await fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!response.ok) {
      trackSpinner.warn({
        text: `Failed to trigger Unsplash download tracking for ${photo.id}. Status: ${response.status} ${response.statusText}`,
      });
    } else {
      trackSpinner.success({ text: `Download tracked for photo ID: ${photo.id}` });
    }
  } catch (error) {
    trackSpinner.error({
      text: `Error tracking Unsplash download for photo ${photo.id}: ${(error as Error).message}`,
    });
    // Log error but don't necessarily stop the process
  }
}
