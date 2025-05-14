import { NextRequest, NextResponse } from 'next/server';
import { getViatorDestinationId } from '@/utils/api/viator-cache';

// Mock data for fallback when the API fails
const MOCK_EXPERIENCES = [
  {
    code: 'MOCK-101',
    title: 'City Walking Tour',
    description: 'Explore the city with a knowledgeable local guide.',
    thumbnailURL: 'https://images.unsplash.com/photo-1569288063643-5d29ad6ad7a5',
    price: { formattedValue: '$49.99' },
    duration: '3 hours',
    rating: 4.7,
    reviewCount: 856,
    categories: [{ name: 'Walking Tour' }, { name: 'Small Group' }],
    webURL: 'https://www.viator.com/tours/City-Tour',
  },
  {
    code: 'MOCK-102',
    title: 'Food Tasting Adventure',
    description: 'Sample the best local cuisine on this guided food tour.',
    thumbnailURL: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636',
    price: { formattedValue: '$79.99' },
    duration: '4 hours',
    rating: 4.9,
    reviewCount: 1243,
    categories: [{ name: 'Food & Drinks' }, { name: 'Small Group' }],
    webURL: 'https://www.viator.com/tours/Food-Tour',
  },
];

/**
 * GET handler for Viator experiences by destination ID
 * This endpoint returns a list of Viator experiences for a specific destination.
 * It uses Viator's POST /search/products endpoint as per their documentation.
 *
 * @param request - The incoming request object
 * @param params - Route parameters containing the destination ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Extract the destination ID from the params
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Get the search parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log(`Processing Viator request for destination ID: ${id}, limit: ${limit}`);

    // If the ID is already a numeric Viator destination ID, use it directly
    // Otherwise, try to map our internal UUID to a Viator destination ID
    let viatorDestId: string | null = null;

    if (/^\d+$/.test(id)) {
      // If the ID is already numeric, it's likely a Viator destination ID
      viatorDestId = id;
      console.log(`Using provided numeric Viator destination ID: ${viatorDestId}`);
    } else {
      // Try to get the Viator destination ID from our database or mapping
      viatorDestId = await getViatorDestinationId(id);
      console.log(
        `Mapped internal ID ${id} to Viator destination ID: ${viatorDestId || 'not found'}`
      );
    }

    // If we couldn't map to a Viator ID, return an error response
    if (!viatorDestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Viator destination ID found for this location',
          details: `Cannot find a Viator mapping for destination ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Check if the API key is available
    if (!process.env.VIATOR_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Viator API key is not configured',
          details: 'VIATOR_API_KEY environment variable is missing',
        },
        { status: 500 }
      );
    }

    // Log that we found the API key (but don't log the key itself)
    console.log('Viator API key found, length:', process.env.VIATOR_API_KEY.length);

    try {
      // Call the Viator search/products API to get experiences for the destination
      // This uses the correct POST endpoint as per Viator documentation
      console.log(`Calling Viator API with destId: ${viatorDestId}, limit: ${limit}`);

      const response = await fetch('https://api.viator.com/partner/v1/search/products', {
        method: 'POST',
        headers: {
          'exp-api-key': process.env.VIATOR_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          destId: viatorDestId,
          topX: limit,
          currencyCode: 'USD',
          sortOrder: 'REVIEW_RATING_AND_BOOKING_COUNT',
        }),
      });

      console.log(`Viator API response status: ${response.status} ${response.statusText}`);

      // If the API returned valid data
      if (response.ok) {
        const result = await response.json();
        console.log(`Fetched ${result.data?.length || 0} experiences from Viator API`);

        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          return NextResponse.json({
            success: true,
            data: result.data,
            totalCount: result.totalCount || result.data.length,
            source: 'viator-api',
            viatorDestinationId: viatorDestId,
          });
        } else {
          // If the API returned no experiences, that's valid - just an empty list
          console.log('Viator API returned empty results for destination ID:', viatorDestId);
          return NextResponse.json({
            success: true,
            data: [],
            totalCount: 0,
            message: 'No experiences found for this destination',
            source: 'viator-api-empty',
            viatorDestinationId: viatorDestId,
          });
        }
      } else {
        // Get error details
        let errorDetails = '';
        try {
          const errorJson = await response.json();
          errorDetails = JSON.stringify(errorJson);
        } catch (e) {
          errorDetails = await response.text();
        }

        console.error(`Viator API error: ${response.status} - ${errorDetails}`);

        // Fall back to mock data when the API call fails
        return NextResponse.json({
          success: true, // Still return success: true for graceful UI degradation
          data: MOCK_EXPERIENCES,
          totalCount: MOCK_EXPERIENCES.length,
          message: 'Using mock data (API request failed)',
          source: 'mock-data-fallback',
          apiError: `Status ${response.status}: ${errorDetails}`,
          viatorDestinationId: viatorDestId,
        });
      }
    } catch (apiError: any) {
      console.error('Viator API request failed:', apiError);

      // Fall back to mock data when the API call fails
      return NextResponse.json({
        success: true, // Still return success: true for graceful UI degradation
        data: MOCK_EXPERIENCES,
        totalCount: MOCK_EXPERIENCES.length,
        message: 'Using mock data (API request failed)',
        source: 'mock-data-fallback',
        apiError: apiError.message,
        viatorDestinationId: viatorDestId,
      });
    }
  } catch (error: any) {
    console.error('Error in Viator experiences handler:', error);

    // Always return a valid response with mock data in case of any error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Viator experiences',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
