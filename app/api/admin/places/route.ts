import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkAdminAuth } from '@/app/admin/utils/auth';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get all places for admin panel
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
