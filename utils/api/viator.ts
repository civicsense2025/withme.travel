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
  return url.includes('?') 
    ? `${url}&${AFFILIATE_PARAMS}` 
    : `${url}?${AFFILIATE_PARAMS}`;
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
    throw new Error('VIATOR_API_KEY is not defined in environment variables');
  }

  const url = new URL(`${VIATOR_API_BASE}${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Viator API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
    endDate: options.endDate
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
 */
export async function getViatorDestinationProducts(destinationId: string, limit: number = 10) {
  return viatorFetch('/products', { 
    destId: destinationId,
    topX: limit
  });
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