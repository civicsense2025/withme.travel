import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// GET: Retrieve a specific survey link
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the specific link
    const { data: link, error: linkError } = await supabase
      .from('survey_links')
      .select(`
        *,
        survey_responses(*)
      `)
      .eq('id', params.linkId)
      .eq('survey_id', params.id)
      .single();
      
    if (linkError) {
      return NextResponse.json({ error: 'Survey link not found' }, { status: 404 });
    }
    
    return NextResponse.json({ link });
  } catch (error) {
    console.error('Error in survey link GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a survey link
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate what can be updated
    const updateData: any = {};
    
    if (body.status && ['active', 'inactive', 'expired'].includes(body.status)) {
      updateData.status = body.status;
    }
    
    if (body.user_info !== undefined) {
      updateData.user_info = body.user_info;
    }
    
    // Ensure there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    // Update the link
    const { data: updatedLink, error: updateError } = await supabase
      .from('survey_links')
      .update(updateData)
      .eq('id', params.linkId)
      .eq('survey_id', params.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating survey link:', updateError);
      return NextResponse.json({ error: 'Failed to update survey link' }, { status: 500 });
    }
    
    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    console.error('Error in survey link PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a survey link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
) {
  const supabase = await createRouteHandlerClient();
  
  try {
    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete the link
    const { error: deleteError } = await supabase
      .from('survey_links')
      .delete()
      .eq('id', params.linkId)
      .eq('survey_id', params.id);
      
    if (deleteError) {
      console.error('Error deleting survey link:', deleteError);
      return NextResponse.json({ error: 'Failed to delete survey link' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in survey link DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 