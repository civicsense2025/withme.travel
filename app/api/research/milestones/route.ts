import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// GET: Retrieve all research milestones
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
    
    // Get all milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('research_milestones')
      .select('*')
      .order('name', { ascending: true });
      
    if (milestonesError) {
      console.error('Error fetching research milestones:', milestonesError);
      return NextResponse.json({ error: 'Failed to fetch research milestones' }, { status: 500 });
    }
    
    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Error in milestones GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new research milestone
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
    
    // Validate required fields
    if (!body.name || !body.event_key) {
      return NextResponse.json({ 
        error: 'Name and event_key are required fields' 
      }, { status: 400 });
    }
    
    // Check if milestone with this event_key already exists
    const { data: existingMilestone, error: existingError } = await supabase
      .from('research_milestones')
      .select('*')
      .eq('event_key', body.event_key)
      .maybeSingle();
      
    if (existingMilestone) {
      return NextResponse.json({ 
        error: 'A milestone with this event_key already exists' 
      }, { status: 400 });
    }
    
    // Create new milestone
    const newMilestone = {
      id: uuidv4(),
      name: body.name,
      event_key: body.event_key,
      description: body.description || null,
      created_by: user.id
    };
    
    const { data: createdMilestone, error: createError } = await supabase
      .from('research_milestones')
      .insert([newMilestone])
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating research milestone:', createError);
      return NextResponse.json({ error: 'Failed to create research milestone' }, { status: 500 });
    }
    
    return NextResponse.json({ milestone: createdMilestone });
  } catch (error) {
    console.error('Error in milestones POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 