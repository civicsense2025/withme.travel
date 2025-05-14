import { cookies } from 'next/headers';
import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { createClient as createServiceClient } from '@/utils/supabase/service-role';
import { Database } from '@/types/database.types';
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * POST /api/admin/seed-surveys
 *
 * Admin-only endpoint that runs the survey definitions seed script
 * This endpoint is deprecated because the 'survey_definitions' table no longer exists in the database schema.
 */
export async function POST() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
