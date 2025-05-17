/**
 * Trip Cities API Route
 * 
 * Handles listing, adding, and removing cities for a trip.
 * 
 * @module api/trips/[tripId]/cities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/tables';

// ============================================================================
// GET: List all cities for a trip
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const supabase = createRouteHandlerClient();
  const { tripId } = params;

  const { data, error } = await supabase
    .from(TABLES.TRIP_CITIES)
    .select(`
      city:city_id (
        id, name, country, admin_name, continent, latitude, longitude, mapbox_id, population, timezone, country_code, metadata, created_at, updated_at, is_destination, emoji, iso2, description
      )
    `)
    .eq('trip_id', tripId);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch cities for trip' }, { status: 500 });
  }

  // Flatten city objects
  const cities = (data ?? []).map((row: any) => row.city);

  return NextResponse.json({ cities });
}

// ============================================================================
// POST: Add cities to a trip
// ============================================================================
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const supabase = createRouteHandlerClient();
  const { tripId } = params;
  const { cities } = await req.json();

  if (!Array.isArray(cities) || cities.length === 0) {
    return NextResponse.json({ error: 'No cities provided' }, { status: 400 });
  }

  // Prepare insert data
  const insertRows = cities.map((city: { id: string }) => ({
    trip_id: tripId,
    city_id: city.id,
  }));

  const { error } = await supabase
    .from(TABLES.TRIP_CITIES)
    .upsert(insertRows, { onConflict: 'trip_id,city_id' });

  if (error) {
    return NextResponse.json({ error: 'Failed to add cities to trip' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ============================================================================
// DELETE: Remove a city from a trip
// ============================================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const supabase = createRouteHandlerClient();
  const { tripId } = params;
  const { cityId } = await req.json();

  if (!cityId) {
    return NextResponse.json({ error: 'cityId is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from(TABLES.TRIP_CITIES)
    .delete()
    .eq('trip_id', tripId)
    .eq('city_id', cityId);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove city from trip' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
