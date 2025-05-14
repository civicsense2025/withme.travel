import { NextRequest, NextResponse } from 'next/server';

// Mock related trips data for graceful degradation
const MOCK_RELATED_TRIPS = [
  {
    id: 'trip-1',
    title: 'Weekend Getaway',
    description: 'A quick escape to experience local culture and cuisine.',
    days: 3,
    image_url: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
    destination: {
      name: 'Sample Destination',
      city: 'Sample City',
      country: 'Sample Country',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'trip-2',
    title: 'Adventure Tour',
    description: 'Explore the great outdoors with this action-packed trip.',
    days: 5,
    image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
    destination: {
      name: 'Sample Destination',
      city: 'Sample City',
      country: 'Sample Country',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'trip-3',
    title: 'Cultural Experience',
    description: 'Immerse yourself in local traditions and historical sites.',
    days: 4,
    image_url: 'https://images.unsplash.com/photo-1569288063643-5d29ad6ad7a5',
    destination: {
      name: 'Sample Destination',
      city: 'Sample City',
      country: 'Sample Country',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'trip-4',
    title: 'Food Tour',
    description: 'A culinary journey through local specialties and hidden gems.',
    days: 2,
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636',
    destination: {
      name: 'Sample Destination',
      city: 'Sample City',
      country: 'Sample Country',
    },
    created_at: new Date().toISOString(),
  },
];

/**
 * GET handler for related trips
 * This is a fallback API route that returns mock data when the original endpoint is missing
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const { searchParams } = request.nextUrl;
    const destinationId = searchParams.get('destinationId');
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    console.log(
      `Fallback API: Fetching related trips for destination ID: ${destinationId}, limit: ${limit}`
    );

    // In a real implementation, you would fetch related trips from the database
    // For now, return mock data with a success message

    return NextResponse.json({
      success: true,
      trips: MOCK_RELATED_TRIPS.slice(0, limit),
      totalCount: MOCK_RELATED_TRIPS.length,
      message: 'Using mock data from fallback API endpoint',
    });
  } catch (error: any) {
    console.error('Error in related trips fallback API:', error);

    // Always return some data for graceful degradation
    return NextResponse.json({
      success: true,
      trips: MOCK_RELATED_TRIPS.slice(0, 2),
      totalCount: 2,
      error: 'Error fetching related trips, using limited mock data',
      message: error.message,
    });
  }
}
