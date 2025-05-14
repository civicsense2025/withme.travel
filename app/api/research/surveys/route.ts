import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';

// Zod schema for form config (fields/questions/logic)
const FormConfigSchema = z.object({
  fields: z.array(
    z.object({
      label: z.string(),
      type: z.string(),
      options: z.any().optional(),
      required: z.boolean().optional(),
      order: z.number().optional(),
      milestone: z.string().optional().nullable(),
      config: z.any().optional(),
    })
  ),
  // ...add more config validation as needed
});

// GET /api/research/surveys
// Returns all active forms (surveys), including their config (fields/questions/logic)
export async function GET() {
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from(TABLES.FORMS)
    .select('*')
    .eq('type', 'survey')
    .eq('is_active', true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ surveys: data });
}

// POST /api/research/surveys
// Accepts a full form definition in config (fields/questions/logic)
// Optionally syncs fields to form_fields for analytics/admin
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  // Validate config
  const configResult = FormConfigSchema.safeParse(body.config);
  if (!configResult.success) {
    return NextResponse.json(
      { error: 'Invalid form config', details: configResult.error.flatten() },
      { status: 400 }
    );
  }
  // Insert form
  const { data, error } = await supabase
    .from(TABLES.FORMS)
    .insert([{ ...body, config: body.config }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Optionally sync fields to form_fields for analytics/admin
  if (body.syncFields) {
    const fields = body.config.fields.map((f: any, i: number) => ({
      ...f,
      form_id: data.id,
      order: f.order ?? i,
    }));
    await supabase.from(TABLES.FORM_FIELDS).insert(fields);
  }
  return NextResponse.json({ form: data });
}
