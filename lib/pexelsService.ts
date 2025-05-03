import chalk from 'chalk';

// Check if we have a Pexels API key
const pexelsApiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

// Simple logger instead of ora spinner
const logger = {
  log: (message: string) => console.log(message),
  success: (message: string) => console.log(`✅ ${message}`),
  error: (message: string) => console.log(`❌ ${message}`),
  warning: (message: string) => console.log(`⚠️ ${message}`),
};

// Define types for Pexels API responses
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
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

interface PexelsSearchResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page: string;
  prev_page: string;
}

// Sample photos for when no API key is available
const SAMPLE_PHOTOS: PexelsPhoto[] = [
  {
    id: 1,
    width: 1200,
    height: 800,
    url: 'https://www.pexels.com/photo/sample-photo-1/',
    photographer: 'Sample Photographer',
    photographer_url: 'https://www.pexels.com/sample-photographer/',
    photographer_id: 1,
    avg_color: '#FFFFFF',
    src: {
      original: '/images/default/city1.jpg',
      large2x: '/images/default/city1.jpg',
      large: '/images/default/city1.jpg',
      medium: '/images/default/city1.jpg',
      small: '/images/default/city1.jpg',
      portrait: '/images/default/city1.jpg',
      landscape: '/images/default/city1.jpg',
      tiny: '/images/default/city1.jpg',
    },
    liked: false,
    alt: 'Sample city photo',
  },
  {
    id: 2,
    width: 1200,
    height: 800,
    url: 'https://www.pexels.com/photo/sample-photo-2/',
    photographer: 'Sample Photographer',
    photographer_url: 'https://www.pexels.com/sample-photographer/',
    photographer_id: 1,
    avg_color: '#FFFFFF',
    src: {
      original: '/images/default/city2.jpg',
      large2x: '/images/default/city2.jpg',
      large: '/images/default/city2.jpg',
      medium: '/images/default/city2.jpg',
      small: '/images/default/city2.jpg',
      portrait: '/images/default/city2.jpg',
      landscape: '/images/default/city2.jpg',
      tiny: '/images/default/city2.jpg',
    },
    liked: false,
    alt: 'Sample city photo 2',
  },
];

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

// Define a utility function instead of importing it
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
 * Search Pexels for images using the API
 */
export async function searchPexels(query: string, perPage = 15) {
  // If no API key, return sample photos
  if (!pexelsApiKey) {
    logger.warning('No Pexels API key found, using sample photos');
    return {
      photos: [],
      success: true,
    };
  }

  logger.log(`Searching Pexels API for "${query}"...`);

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=${perPage}`;

    const response = await fetch(url, {
      headers: {
        Authorization: pexelsApiKey,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text().catch(() => 'Unknown error');
      logger.error(`Pexels API Error: ${response.status} ${errorDetails}`);
      return { success: false, photos: [], error: `API error: ${response.status}` };
    }

    const data = await response.json();
    logger.success(`Found ${data.total_results} Pexels results for "${query}"`);

    return { photos: data.photos, success: true };
  } catch (error) {
    logger.error(`Failed to search Pexels: ${(error as Error).message}`);
    return { success: false, photos: [], error: (error as Error).message };
  }
}

/**
 * Find a city image using Pexels
 */
export async function findCityImage(city: string, country: string) {
  try {
    // Try with specific queries first for better results
    const queries = [
      `${city} ${country} cityscape`,
      `${city} skyline`,
      `${city} ${country}`,
      `${city} landmarks`,
      `${city} streets`,
      city,
    ];

    // Try each query in order until we find a good image
    for (const query of queries) {
      logger.log(`Attempting Pexels search with query: "${query}"`);
      
      try {
        const { photos, success } = await searchPexels(query, 5);
        
        if (!success || !photos || photos.length === 0) {
          logger.warning(`No results for: ${query}`);
          continue;
        }
        
        // Get a random photo from the results
        const randomIndex = Math.floor(Math.random() * photos.length);
        const photo = photos[randomIndex];
        logger.success(`Found Pexels image using query: "${query}"`);
        
        return {
          url: photo.src.large,
          success: true,
        };
      } catch (error) {
        logger.warning(`Error: ${(error as Error).message}`);
      }
    }
    
    // If all queries fail, return null
    logger.warning(`No Pexels results for query: "${city}"`);
    return { url: null, success: false, error: 'No images found' };
  } catch (error) {
    return {
      url: null,
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Get a random Pexels image for a destination
 */
export async function getRandomDestinationImage(
  city: string,
  state?: string,
  country?: string,
  options: {
    orientation?: 'landscape' | 'portrait' | 'square';
  } = {}
) {
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
      `${city} travel`,
    ];

    console.log(chalk.dim(`  (Pexels Query Keywords: ${randomKeyword1}, ${uniqueKeyword2})`));

    // Try each query until we find a result
    for (const query of searchQueries) {
      const spinner = ora(`Attempting Pexels search with query: "${query}"`).start();

      const { photos, error } = await searchPexels(query, {
        perPage: 30,
        orientation: options.orientation || 'landscape',
      });

      if (error) {
        spinner.warn({ text: error });
        continue; // Try the next query
      }

      if (photos.length > 0) {
        const randomIndex = random(0, Math.min(photos.length - 1, 9)); // Pick from top 10 results
        spinner.succeed({ text: `Found Pexels image using query: "${query}"` });
        
        const photo = photos[randomIndex];
        
        // Create the proper attribution HTML
        const attributionHtml = `Photo by <a href="${photo.photographer_url}" target="_blank" rel="noopener noreferrer">${photo.photographer}</a> on <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>`;
        
        return {
          success: true,
          image: {
            id: photo.id.toString(),
            url: photo.url,
            width: photo.width,
            height: photo.height,
            alt: `${city}, ${country}`,
            src: photo.src.large2x,
            thumb: photo.src.medium,
            attribution: attributionHtml,
            photographer: photo.photographer,
            photographer_url: photo.photographer_url,
          },
        };
      }
      
      spinner.warn({ text: `No Pexels results for query: "${query}"` });
    }
    
    // If we get here, we didn't find any images with any of our queries
    return {
      success: false,
      error: `Could not find any suitable Pexels image for ${city}, ${country} after trying multiple random queries.`
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error searching Pexels for ${city}: ${(error as Error).message}`,
    };
  }
}