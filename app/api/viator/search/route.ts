import { NextRequest, NextResponse } from 'next/server';
import { searchViatorFreeText } from '@/utils/api/viator';

/**
 * GET handler for Viator freetext search
 * This endpoint searches for Viator products using free text.
 * It uses Viator's /search/freetext endpoint as per their documentation.
 *
 * @param request - The incoming request object with query parameter
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const destId = searchParams.get('destId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const currencyCode = searchParams.get('currencyCode') || 'USD';

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log(`Processing Viator freetext search for query: "${query}"`);

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
      // Call the Viator freetext search API
      const result = await searchViatorFreeText(query, {
        destId: destId || undefined,
        topX: limit,
        currencyCode,
      });

      // Return the search results
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
          error: 'Failed to search Viator API',
          details: apiError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in Viator search handler:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search Viator products',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
