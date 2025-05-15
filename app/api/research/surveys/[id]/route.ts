import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { FORM_TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

/**
 * GET /api/research/surveys/:id
 * Returns a survey by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Get the form with the given ID
    const { data, error } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching survey:', error);
      return NextResponse.json(
        { error: 'Failed to fetch survey' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Convert data to expected Survey format
    const survey = {
      id: data.id,
      name: data.name || 'Untitled Survey',
      description: data.description,
      type: data.type || 'general',
      is_active: data.is_active !== false,
      config: data.config || { fields: [] },
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(survey);
  } catch (error) {
    console.error('Unhandled error in survey API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/research/surveys/:id
 * Updates a survey by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    const body = await request.json();

    // Validate the request body
    // You can add Zod schema validation here if needed

    // Update the survey
    const { data, error } = await supabase
      .from(FORM_TABLES.FORMS)
      .update({
        name: body.name,
        description: body.description,
        type: body.type,
        is_active: body.is_active,
        config: body.config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating survey:', error);
      return NextResponse.json(
        { error: 'Failed to update survey' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unhandled error in survey API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/research/surveys/:id
 * Deletes a survey by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Delete the survey
    const { error } = await supabase
      .from(FORM_TABLES.FORMS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting survey:', error);
      return NextResponse.json(
        { error: 'Failed to delete survey' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unhandled error in survey API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
