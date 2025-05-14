import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
// Direct table/field names used instead of imports
import { Database } from '@/types/database.types';

// DEPRECATED: This endpoint previously relied on removed or deprecated tables. It is now deprecated and will be removed in a future release.
export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
