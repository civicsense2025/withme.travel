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

// GET /api/research/surveys/[id]
// Returns the form (survey) with its config (fields/questions/logic)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from(TABLES.FORMS)
    .select('*')
    .eq('id', params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ form: data });
}

// PATCH /api/research/surveys/[id]
// Updates the form config (fields/questions/logic). Optionally syncs fields to form_fields.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  // Validate config
  if (body.config) {
    const configResult = FormConfigSchema.safeParse(body.config);
    if (!configResult.success) {
      return NextResponse.json(
        { error: 'Invalid form config', details: configResult.error.flatten() },
        { status: 400 }
      );
    }
  }
  // Update form
  const { data, error } = await supabase
    .from(TABLES.FORMS)
    .update({ ...body })
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Optionally sync fields to form_fields for analytics/admin
  if (body.syncFields && body.config?.fields) {
    await supabase.from(TABLES.FORM_FIELDS).delete().eq('form_id', params.id);
    const fields = body.config.fields.map((f: any, i: number) => ({
      ...f,
      form_id: params.id,
      order: f.order ?? i,
    }));
    await supabase.from(TABLES.FORM_FIELDS).insert(fields);
  }
  return NextResponse.json({ form: data });
}

// DELETE /api/research/surveys/[id]
// Deletes the form and cascades deletes
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createRouteHandlerClient();
  const { error } = await supabase.from(TABLES.FORMS).delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
