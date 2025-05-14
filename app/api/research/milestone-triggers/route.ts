import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { FORM_TABLES, TABLES } from '@/utils/constants/tables';
import { z } from 'zod';
import { EventType } from '@/types/research';

// Zod schema for validating milestone trigger creation
const MilestoneTriggerSchema = z.object({
  event_type: z.custom<EventType>(),
  form_id: z.string().uuid(),
  active: z.boolean().default(true),
  priority: z.number().int().min(0).max(100).default(10),
  filter_key: z.string().optional(),
  filter_value: z.string().optional(),
  description: z.string().optional(),
});

// Zod schema for validating milestone trigger updates
const MilestoneTriggerUpdateSchema = z.object({
  event_type: z.custom<EventType>().optional(),
  form_id: z.string().uuid().optional(),
  active: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  filter_key: z.string().optional(),
  filter_value: z.string().optional(),
  description: z.string().optional(),
});

/**
 * GET /api/research/milestone-triggers
 * Retrieve all milestone triggers or a specific one by ID
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const eventType = searchParams.get('event_type');
  const formId = searchParams.get('form_id');
  const activeOnly = searchParams.get('active_only') === 'true';
  
  try {
    let query = supabase
      .from(FORM_TABLES.MILESTONE_TRIGGERS)
      .select('*, form:forms(id, title, description, is_active)');
      
    // Apply filters
    if (id) {
      query = query.eq('id', id);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (formId) {
      query = query.eq('form_id', formId);
    }
    if (activeOnly) {
      query = query.eq('active', true);
    }
    
    // Order by priority (highest first)
    query = query.order('priority', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching milestone triggers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ triggers: data });
  } catch (error) {
    console.error('Unexpected error in milestone triggers GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/research/milestone-triggers
 * Create a new milestone trigger
 */
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  
  try {
    const body = await request.json();
    
    // Validate the request body
    const result = MilestoneTriggerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid milestone trigger data', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    // Check if the form exists
    const { data: formData, error: formError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('id')
      .eq('id', result.data.form_id)
      .single();
      
    if (formError || !formData) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    // Create the milestone trigger
    const { data, error } = await supabase
      .from(FORM_TABLES.MILESTONE_TRIGGERS)
      .insert([result.data])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating milestone trigger:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ trigger: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in milestone triggers POST endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/research/milestone-triggers/:id
 * Update an existing milestone trigger
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createRouteHandlerClient();
  const id = params.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Trigger ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate the request body
    const result = MilestoneTriggerUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid milestone trigger data', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    // Check if form_id is being updated and if it exists
    if (result.data.form_id) {
      const { data: formData, error: formError } = await supabase
        .from(FORM_TABLES.FORMS)
        .select('id')
        .eq('id', result.data.form_id)
        .single();
        
      if (formError || !formData) {
        return NextResponse.json(
          { error: 'Form not found' },
          { status: 404 }
        );
      }
    }
    
    // Update the milestone trigger
    const { data, error } = await supabase
      .from(FORM_TABLES.MILESTONE_TRIGGERS)
      .update(result.data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating milestone trigger:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Milestone trigger not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ trigger: data });
  } catch (error) {
    console.error('Unexpected error in milestone triggers PATCH endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/research/milestone-triggers/:id
 * Delete a milestone trigger
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createRouteHandlerClient();
  const id = params.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Trigger ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Delete the milestone trigger
    const { data, error } = await supabase
      .from(FORM_TABLES.MILESTONE_TRIGGERS)
      .delete()
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error deleting milestone trigger:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Milestone trigger not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, deleted: data });
  } catch (error) {
    console.error('Unexpected error in milestone triggers DELETE endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
