import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import type { Database } from '@/types/database.types';

// Define places table constant
const PLACES_TABLE = TABLES.PLACES;

// --- Types ---
interface Place {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  price_level: number | null;
  destination_id: string;
  is_verified: boolean;
  suggested_by: string | null;
  source: string;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  rating_count: number;
  place_type?: string | null;
  [key: string]: any;
}

interface PlaceResponse {
  data: Place[] | Place | null;
  success: true;
  message?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams?.get('destination_id');
    const query = searchParams?.get('query');
    const type = searchParams?.get('type');

    if (!destinationId) {
      return NextResponse.json(
        { error: 'Destination ID is required', success: false },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Type safety for Supabase query
    const placesQuery = supabase
      .from(TABLES.PLACES)
      .select('*')
      .eq('destination_id', destinationId)
      .order('rating', { ascending: false });

    let filteredQuery = placesQuery;
    if (query) {
      filteredQuery = filteredQuery.ilike('name', `%${query}%`);
    }
    if (type) {
      filteredQuery = filteredQuery.eq('place_type', type);
    }

    const { data: places, error } = await filteredQuery;

    if (error) {
      console.error('Error fetching places:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch places', success: false },
        { status: 500 }
      );
    }

    if (!places) {
      return NextResponse.json({ data: [], success: true }, { status: 200 });
    }

    // Defensive: fallback for missing fields
    const processedPlaces = places.map((place) => ({
      ...place,
      rating: place.rating ?? 0,
      rating_count: place.rating_count ?? 0,
    }));

    return NextResponse.json({ data: processedPlaces, success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in places route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}

// POST /api/places - Add a new place suggestion
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();

    // 1. Check user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { name, description, category, address, price_level, destination_id } = body;

    // 3. Validate required fields
    if (!name || !destination_id || !category) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, destination_id, and category are required.',
          success: false,
        },
        { status: 400 }
      );
    }

    // Type-safe insert definition
    const placeToInsert = {
      name,
      description: description || null,
      category: category || 'other',
      address: address || null,
      price_level: price_level || null,
      destination_id,
      is_verified: false,
      suggested_by: user.id,
      source: 'user_suggestion',
      latitude: null,
      longitude: null,
      rating: null,
      rating_count: 0,
    };

    const { data: newPlace, error: insertError } = await supabase
      .from(TABLES.PLACES)
      .insert(placeToInsert)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting suggested place:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to save suggestion.', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newPlace, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/places route:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body', success: false }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}
