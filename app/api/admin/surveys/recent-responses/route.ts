import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';

// Define the formatted response we want to return
interface FormattedResponse {
  id: string;
  survey_id: string;
  name: string | null;
  email: string | null;
  completed_at: string | null;
  source: string | null;
  created_at: string;
  survey_title: string;
}

/**
 * GET /api/admin/surveys/recent-responses
 * Fetch recent survey responses for the admin dashboard
 * This endpoint is deprecated because the 'survey_responses' table no longer exists in the database schema.
 */
export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
