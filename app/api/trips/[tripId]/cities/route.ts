import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database-multi-city';

// Define API response types
interface SuccessResponse<T> {
  data: T;
  success: true;
  message?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// Define city-related types
interface City {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  continent?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

interface TripCity {
  id: string;
  trip_id: string;
  city_id: string;
  position: number | null;
  arrival_date: string | null;
  departure_date: string | null;
  city: City | null;
}

/**
 * DEPRECATED: This endpoint previously relied on the 'places' table, which no longer exists in the database schema.
 * This feature is deprecated and will be removed in a future release.
 */
export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}

/**
 * POST handler to add a city to a trip
 */
export async function POST() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}

/**
 * PUT handler to reorder cities in a trip
 */
export async function PUT(request: NextRequest, { params }: { params: { tripId: string } }) {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}

// DEPRECATED: This endpoint previously relied on the 'places' table, which no longer exists in the database schema.
// This feature is deprecated and will be removed in a future release.

export async function DELETE() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
