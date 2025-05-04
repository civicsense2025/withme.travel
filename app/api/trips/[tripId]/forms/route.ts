import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { isUserTripMember } from '@/utils/api-helpers/trip-permissions';

// Schema for validating form creation/updates
const formSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  visibility: z.enum(['private', 'members', 'public']),
  form_type: z.enum(['general', 'accommodation', 'transportation', 'activities', 'food', 'feedback', 'custom']),
  allow_anonymous: z.boolean().optional(),
  expires_at: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  trip_id: z.string().uuid(),
  parent_form_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  is_template: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
  custom_theme: z.record(z.any()).optional(),
  logo_url: z.string().url().optional(),
  progress_save_duration: z.number().optional(), // in hours
});

// GET: Fetch forms for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    const supabase = await createRouteHandlerClient();
    
    // Check if user is a trip member
    const { isAuthorized, userId, error } = await isUserTripMember(supabase, tripId);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch all forms for this trip - use string literal instead of TABLES constant
    const { data: forms, error: fetchError } = await supabase
      .from('forms')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    return NextResponse.json({ forms: forms || [] });
  } catch (error) {
    console.error('Error fetching trip forms:', error);
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

// POST: Create a new form for a trip
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    const supabase = await createRouteHandlerClient();
    
    // Check if user is a trip member with edit permission
    const { isAuthorized, userId, role } = await isUserTripMember(supabase, tripId);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin and editor can create forms
    if (role !== 'admin' && role !== 'editor') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate the form data
    const validationResult = formSchema.safeParse({
      ...body,
      trip_id: tripId
    });
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid form data', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    const formData = validationResult.data;
    
    // Create the form - use string literal instead of TABLES constant
    const { data: form, error } = await supabase
      .from('forms')
      .insert({
        ...formData,
        created_by: userId
      })
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If this form is created from a template, copy the questions
    if (formData.template_id) {
      const { data: templateQuestions, error: templateError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formData.template_id);
        
      if (!templateError && templateQuestions?.length > 0) {
        // Prepare questions for the new form
        const newQuestions = templateQuestions.map(q => ({
          ...q,
          id: undefined, // Let Supabase generate new IDs
          form_id: form.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        // Insert questions
        await supabase
          .from('questions')
          .insert(newQuestions);
      }
    }
    
    return NextResponse.json({ form });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
  }
}

// PATCH: Update a form
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    const supabase = await createRouteHandlerClient();
    
    // Check if user is a trip member with edit permission
    const { isAuthorized, role } = await isUserTripMember(supabase, tripId);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin and editor can update forms
    if (role !== 'admin' && role !== 'editor') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const body = await request.json();
    const { formId, ...updateData } = body;
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    // Verify the form belongs to this trip
    const { data: existingForm, error: checkError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('trip_id', tripId)
      .single();
      
    if (checkError || !existingForm) {
      return NextResponse.json({ error: 'Form not found for this trip' }, { status: 404 });
    }
    
    // Update the form
    const { data: updatedForm, error } = await supabase
      .from('forms')
      .update(updateData)
      .eq('id', formId)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ form: updatedForm });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

// DELETE: Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get('formId');
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }
    
    const supabase = await createRouteHandlerClient();
    
    // Check if user is a trip member with admin permission
    const { isAuthorized, role } = await isUserTripMember(supabase, tripId);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin can delete forms
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Verify the form belongs to this trip
    const { data: existingForm, error: checkError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('trip_id', tripId)
      .single();
      
    if (checkError || !existingForm) {
      return NextResponse.json({ error: 'Form not found for this trip' }, { status: 404 });
    }
    
    // First delete related questions and responses
    // Get all response sessions for this form
    const { data: sessions } = await supabase
      .from('response_sessions')
      .select('id')
      .eq('form_id', formId);
      
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id);
      
      // Delete responses for these sessions
      await supabase
        .from('responses')
        .delete()
        .in('session_id', sessionIds);
        
      // Delete the sessions
      await supabase
        .from('response_sessions')
        .delete()
        .eq('form_id', formId);
    }
    
    // Delete questions
    await supabase
      .from('questions')
      .delete()
      .eq('form_id', formId);
    
    // Finally delete the form
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', formId);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
