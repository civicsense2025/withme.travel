// app/api/destinations/[id]/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { TABLES, FIELDS } from "@/utils/constants/database";

// Placeholder for database fetching logic
async function getReviewsForDestination(
  destinationId: string,
  sortBy: string | null,
  season: string | null,
  travelType: string | null
): Promise<any[]> {
  console.log(`Fetching reviews for destination: ${destinationId}`);
  console.log(`Sort by: ${sortBy}, Season: ${season}, Travel Type: ${travelType}`);
  // TODO: Implement actual database query to fetch reviews based on ID and filters
  // Example:
  // const supabase = createServerSupabaseClient()
  // const { data, error } = await supabase
  //   .from(TABLES.TRIP_REVIEWS)
  //   .select('*')
  //   .eq(FIELDS.DESTINATION_ID, destinationId)
  //   .order(sortBy || FIELDS.CREATED_AT, { ascending: false })
  // if (error) throw error
  // return data

  return []; // Return empty array for now
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destinationId = id;

  const { searchParams } = request.nextUrl;
  const sortBy = searchParams?.get('sort_by');
  const season = searchParams?.get('season');
  const travelType = searchParams?.get('travel_type');

  if (!destinationId) {
    return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
  }

  try {
    const reviews = await getReviewsForDestination(destinationId, sortBy, season, travelType);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching destination reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
