import { NextRequest, NextResponse } from 'next/server';
import { searchViatorAttractions } from '@/utils/api/viator';

/**
 * GET handler for Viator attractions by destination ID
 * This endpoint returns a list of attractions for a specific destination.
 * It uses Viator's /attractions/search endpoint as per their documentation.
 *
 * @param request - The incoming request object with destinationId query parameter
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const destinationId = searchParams.get('destinationId');
    const count = parseInt(searchParams.get('count') || '30', 10);
    const start = parseInt(searchParams.get('start') || '1', 10);
    const sortOrder =
      (searchParams.get('sortOrder') as 'ALPHABETICAL' | 'DEFAULT' | 'REVIEW_AVG_RATING') ||
      'REVIEW_AVG_RATING';

    // Validate required parameters
    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    console.log(`Processing Viator attractions request for destination ID: ${destinationId}`);

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

    try {
      // Call the Viator attractions search API
      const result = await searchViatorAttractions(destinationId, {
        count,
        start,
        sortOrder,
      });

      // Return the attraction data
      return NextResponse.json({
        success: true,
        data: result.data || [],
        totalCount: result.totalCount || 0,
        source: 'viator-api',
      });
    } catch (apiError: any) {
      console.error('Viator API request failed:', apiError);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch attractions from Viator API',
          details: apiError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in Viator attractions handler:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Viator attractions',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
