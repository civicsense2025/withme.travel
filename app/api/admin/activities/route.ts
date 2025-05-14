import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkAdminAuth } from '@/app/admin/utils/auth';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get all activities for admin panel
 * Note: This endpoint assumes there's an 'activities' table in the database
 * This endpoint is deprecated because the 'activities' table no longer exists in the database schema.
 */
export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
