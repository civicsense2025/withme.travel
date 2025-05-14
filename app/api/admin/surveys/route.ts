import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface SurveyDefinition {
  id: string;
  survey_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: any;
}

/**
 * GET /api/admin/surveys
 * Fetch all survey definitions with response counts
 */
export async function GET() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
