/**
 * API Route: /api/research/forms
 *
 * Returns a list of active forms (surveys) available for a given cohort.
 * Accepts 'cohort' and 'token' as query params.
 *
 * @module api/research/forms/route
 */
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * GET /api/research/forms?cohort=...&token=...
 * Returns all active forms for the given cohort.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const cohort = url.searchParams.get('cohort');
  const token = url.searchParams.get('token');

  if (!cohort) {
    return NextResponse.json({ error: 'Missing cohort' }, { status: 400 });
  }

  // Optionally: validate the token/session here (future-proof)

  const supabase = await createRouteHandlerClient();

  // Query forms where the cohort is included in the allowed cohorts (jsonb array)
  const { data, error } = await supabase
    .from(TABLES.FORMS)
    .select('*')
    .contains('cohorts', [cohort]) // 'cohorts' is a jsonb array field
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ forms: data });
} 