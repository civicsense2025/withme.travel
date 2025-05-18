import { NextRequest, NextResponse } from 'next/server';
import { listItineraries, createItinerary } from '@/lib/api/itineraries';
import { generateSlug } from '@/utils/helpers';

// Define constants for tables/fields not in the imported constants
const ITINERARY_FIELDS = {
  ITINERARY_TEMPLATES: {
    IS_PUBLISHED: 'is_published',
    CREATED_AT: 'created_at',
    CREATED_BY: 'created_by',
  },
  PROFILES: {
    ID: 'id',
  },
  COMMON: {
    CREATED_AT: 'created_at',
  },
};

/**
 * Check if a user is an admin
 */
async function isAdminUser(supabase: any, userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('[API] Error checking admin status:', error);
      return false;
    }

    return !!data.is_admin;
  } catch (error) {
    console.error('[API] Error checking admin status:', error);
    return false;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Parse request parameters
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const isPublished = searchParams.get('published') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  // Call the centralized API function
  const result = await listItineraries({ isPublished, limit, offset });
  
  if (!result.success) {
    console.error('[API] Error in itineraries endpoint:', result.error);
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const itineraryData = await request.json();
    
    // Generate a slug if not provided
    if (!itineraryData.slug) {
      itineraryData.slug = generateSlug(itineraryData.title);
    }
    
    // Call the centralized API function
    const result = await createItinerary(itineraryData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    console.error('[API] Error processing itinerary creation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create itinerary' },
      { status: 500 }
    );
  }
}
