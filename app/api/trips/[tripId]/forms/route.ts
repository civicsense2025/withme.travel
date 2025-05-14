import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { isUserTripMember } from '@/utils/api-helpers/trip-permissions';
import { TABLES } from '@/utils/constants/tables';

// Schema for validating form creation/updates
const formSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  visibility: z.enum(['private', 'members', 'public']),
  form_type: z.enum([
    'general',
    'accommodation',
    'transportation',
    'activities',
    'food',
    'feedback',
    'custom',
  ]),
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
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this trip
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Fetch all forms associated with the trip
    const { data: forms, error: formsError } = await supabase
      .from(TABLES.FORMS)
      .select(
        `
        *,
        created_by:profiles!created_by(id, name, avatar_url),
        responses:${TABLES.FORM_RESPONSES}(id, user_id, submission_date)
      `
      )
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (formsError) {
      console.error('Error fetching forms:', formsError);
      return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
    }

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new form for a trip
export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get and validate the form data
    const data = await request.json();
    const validation = formSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Access properties that exist in the schema
    const { title, description, metadata, form_type = 'general' } = validation.data;

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this trip
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this trip' }, { status: 403 });
    }

    // Create the form using fields that match the database schema
    const { data: form, error: formError } = await supabase
      .from(TABLES.FORMS)
      .insert({
        name: title, // Using 'name' instead of 'title' based on DB schema
        description,
        config: metadata || {}, // Using 'config' instead of 'metadata'
        type: form_type, // Required field
        created_by: user.id,
        // Add any other required fields from your database schema
      })
      .select()
      .single();

    if (formError) {
      console.error('Error creating form:', formError);
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a form
export async function PATCH(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const { tripId } = params;
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
      .from(TABLES.FORMS)
      .select('id')
      .eq('id', formId)
      .eq('trip_id', tripId)
      .single();

    if (checkError || !existingForm) {
      return NextResponse.json({ error: 'Form not found for this trip' }, { status: 404 });
    }

    // Update the form
    const { data: updatedForm, error } = await supabase
      .from(TABLES.FORMS)
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
export async function DELETE(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const { tripId } = params;
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
      .from(TABLES.FORMS)
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
      .from(TABLES.RESPONSE_SESSIONS)
      .select('id')
      .eq('form_id', formId);

    if (sessions && sessions.length > 0) {
      // Delete responses for these sessions
      const sessionIds = sessions.map((session) => session.id);
      await supabase.from(TABLES.RESPONSES).delete().in('session_id', sessionIds);

      // Delete sessions
      await supabase.from(TABLES.RESPONSE_SESSIONS).delete().eq('form_id', formId);
    }

    // Delete questions
    await supabase.from(TABLES.QUESTIONS).delete().eq('form_id', formId);

    // Finally delete the form
    const { error: deleteError } = await supabase.from(TABLES.FORMS).delete().eq('id', formId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
