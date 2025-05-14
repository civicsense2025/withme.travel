import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';

// Zod schema for a form field (for analytics/admin/legacy only)
const FormFieldSchema = z.object({
  label: z.string(),
  type: z.string(),
  options: z.any().optional(),
  required: z.boolean().optional(),
  order: z.number().optional(),
  milestone: z.string().optional().nullable(),
  config: z.any().optional(),
});

// GET /api/research/surveys/[id]/fields
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from(TABLES.FORM_FIELDS)
    .select('*')
    .eq('form_id', params.id)
    .order('order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fields: data });
}

// POST /api/research/surveys/[id]/fields
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  // Validate field
  const result = FormFieldSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid field', details: result.error.flatten() },
      { status: 400 }
    );
  }
  // Insert field
  const { data, error } = await supabase
    .from(TABLES.FORM_FIELDS)
    .insert([{ ...body, form_id: params.id }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ field: data });
}
