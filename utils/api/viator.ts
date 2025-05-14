/**
 * Viator API utilities for withme.travel
 *
 * This file provides utilities for interacting with the Viator Partner API
 * and generating properly formatted affiliate links.
 */

const VIATOR_API_BASE = 'https://api.viator.com/partner/v1';
const VIATOR_WEB_BASE = 'https://www.viator.com';

// Affiliate parameters that must be appended to all Viator URLs
const AFFILIATE_PARAMS = 'pid=P00250046&mcid=42383&medium=link&campaign=wtm';

/**
 * Appends our affiliate parameters to any Viator URL
 */
export function appendViatorAffiliate(url: string): string {
  return url.includes('?') ? `${url}&${AFFILIATE_PARAMS}` : `${url}?${AFFILIATE_PARAMS}`;
}

/**
 * Builds a destination URL for Viator with our affiliate params
 */
export function buildDestinationUrl(destinationId: string, destinationName: string): string {
  // Format: https://www.viator.com/London/d737-ttd?pid=P00250046&mcid=42383&medium=link&campaign=wtm
  const formattedName = destinationName.replace(/\s+/g, '-');
  return appendViatorAffiliate(`${VIATOR_WEB_BASE}/${formattedName}/d${destinationId}-ttd`);
}

/**
 * Builds a product URL for Viator with our affiliate params
 */
export function buildProductUrl(productCode: string, productName: string): string {
  // Format: https://www.viator.com/tours/London/Tower-of-London-Ticket/d737-3251TOWER?pid=...
  const formattedName = productName.replace(/\s+/g, '-');
  return appendViatorAffiliate(`${VIATOR_WEB_BASE}/tours/${formattedName}/d${productCode}`);
}

/**
 * Makes a request to the Viator Partner API
 */
export async function viatorFetch(endpoint: string, params: Record<string, any> = {}) {
  const apiKey = process.env.VIATOR_API_KEY;

  if (!apiKey) {
    console.error('VIATOR_API_KEY is not defined in environment variables');
    throw new Error('VIATOR_API_KEY is not defined in environment variables');
  }

  const url = new URL(`${VIATOR_API_BASE}${endpoint}`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  console.log(`Making Viator API request to: ${endpoint} with params:`, params);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'exp-api-key': apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Log the response status
    console.log(`Viator API response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get more details from the error response
      let errorDetails = '';
      try {
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
      } catch (e) {
        errorDetails = await response.text();
      }

      console.error(`Viator API error response: ${errorDetails}`);
      throw new Error(
        `Viator API error: ${response.status} ${response.statusText} - ${errorDetails}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Viator API:', error);
    throw error;
  }
}

/**
 * Searches for experiences using Viator's text search API
 */
export async function searchViatorExperiences(
  query: string,
  options: {
    destId?: string;
    topX?: number;
    currencyCode?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  return viatorFetch('/products/search', {
    text: query,
    destId: options.destId,
    topX: options.topX || 10,
    currencyCode: options.currencyCode || 'USD',
    startDate: options.startDate,
    endDate: options.endDate,
  });
}

/**
 * Gets details for a specific product by product code
 */
export async function getViatorProductDetails(productCode: string) {
  return viatorFetch(`/products/${productCode}`);
}

/**
 * Gets available products for a specific destination
 *
 * Uses the POST /search/products endpoint as recommended by Viator
 * instead of the deprecated GET /products endpoint.
 */
export async function getViatorDestinationProducts(destinationId: string, limit: number = 10) {
  try {
    console.log(
      `Fetching Viator products for destination ID: ${destinationId} with limit: ${limit}`
    );

    // Using the POST /search/products endpoint (proper endpoint according to Viator docs)
    const response = await fetch(`${VIATOR_API_BASE}/search/products`, {
      method: 'POST',
      headers: {
        'exp-api-key': process.env.VIATOR_API_KEY!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        destId: destinationId,
        topX: limit,
        currencyCode: 'USD',
        sortOrder: 'REVIEW_RATING_AND_BOOKING_COUNT',
      }),
    });

    // Log the response status
    console.log(
      `Viator POST /search/products response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      // Try to get more details from the error response
      let errorDetails = '';
      try {
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
      } catch (e) {
        errorDetails = await response.text();
      }

      console.error(`Viator search/products API error response: ${errorDetails}`);
      throw new Error(
        `Viator API error: ${response.status} ${response.statusText} - ${errorDetails}`
      );
    }

    const data = await response.json();

    // Log the response structure to help debug
    console.log(
      `Viator search/products API returned data with keys: ${Object.keys(data).join(', ')}`
    );

    // Check if the response has the expected structure
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('Unexpected Viator API response format:', data);
      return {
        data: [],
        totalCount: 0,
        error: 'Invalid API response format',
      };
    }

    // Return properly formatted data
    return {
      data: data.data,
      totalCount: data.totalCount || data.data.length,
    };
  } catch (error) {
    console.error(`Error fetching Viator products for destination ID ${destinationId}:`, error);
    throw error;
  }
}

/**
 * Tracks a click on a Viator affiliate link
 */
export async function trackViatorLinkClick(
  url: string,
  metadata: {
    userId?: string;
    tripId?: string;
    productCode?: string;
    pageContext: string;
    additionalData?: Record<string, any>;
  }
) {
  // This would be an API call to your own backend
  try {
    const response = await fetch('/api/viator/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        affiliateUrl: url,
        userId: metadata.userId,
        tripId: metadata.tripId,
        productCode: metadata.productCode,
        pageContext: metadata.pageContext,
        metadata: metadata.additionalData,
        clickedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to track Viator link click');
    }

    return response.ok;
  } catch (error) {
    console.error('Error tracking Viator link click:', error);
    return false; // Return false but don't stop the user experience
  }
}

/**
 * Gets attractions for a specific destination
 * Uses the /attractions/search endpoint as recommended by Viator
 */
export async function searchViatorAttractions(
  destinationId: string,
  options: {
    count?: number;
    start?: number;
    sortOrder?: 'ALPHABETICAL' | 'DEFAULT' | 'REVIEW_AVG_RATING';
  } = {}
) {
  try {
    console.log(`Searching attractions for destination ID: ${destinationId}`);

    return viatorFetch('/attractions/search', {
      destId: destinationId,
      count: options.count || 30,
      start: options.start || 1,
      sortOrder: options.sortOrder || 'REVIEW_AVG_RATING',
    });
  } catch (error) {
    console.error(`Error searching attractions for destination ID ${destinationId}:`, error);
    throw error;
  }
}

/**
 * Free text search for Viator products
 * Uses the /search/freetext endpoint as recommended by Viator
 */
export async function searchViatorFreeText(
  query: string,
  options: {
    destId?: string;
    topX?: number;
    currencyCode?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  try {
    console.log(`Performing freetext search for query: "${query}"`);

    return viatorFetch('/search/freetext', {
      text: query,
      destId: options.destId,
      topX: options.topX || 10,
      currencyCode: options.currencyCode || 'USD',
      startDate: options.startDate,
      endDate: options.endDate,
    });
  } catch (error) {
    console.error(`Error searching freetext for query "${query}":`, error);
    throw error;
  }
}
