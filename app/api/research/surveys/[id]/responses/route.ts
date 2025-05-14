import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';

// Zod schema for a form response (responses is a JSON object)
const FormResponseSchema = z.object({
  responses: z.record(z.any()),
  session_id: z.string().optional().nullable(),
  user_id: z.string().optional().nullable(),
  milestone: z.string().optional().nullable(),
});

// POST /api/research/surveys/[id]/responses
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  // Validate response
  const result = FormResponseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid response', details: result.error.flatten() },
      { status: 400 }
    );
  }
  // Insert response
  const { data, error } = await supabase
    .from(TABLES.FORM_RESPONSES)
    .insert([{ ...body, form_id: params.id }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ response: data });
}
