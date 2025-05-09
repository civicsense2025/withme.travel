import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getGuestToken } from '@/utils/guest';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/database';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Validation schema for creating/updating ideas
const ideaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().nullish(),
  type: z.enum([
    'DESTINATION',
    'DATE',
    'ACTIVITY',
    'BUDGET',
    'OTHER'
  ]),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  }).nullish(),
  meta: z.record(z.any()).nullish()
});

/**
 * GET /api/groups/[id]/plans/ideas
 * Retrieves all ideas across all plans for a group
 */
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  // Properly await params before using them
  const params = await context.params;
  const groupId = params.id;
  const supabase = await createRouteHandlerClient();

  // Get authenticated user to verify permissions
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // First check if user is a member of this group
    const { data: memberData, error: memberError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (memberError) {
      console.error('Error checking group membership:', memberError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }
    
    if (!memberData) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }
    
    // Get all plan IDs for this group
    const { data: plansData, error: plansError } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select('id')
      .eq('group_id', groupId);
    
    if (plansError) {
      console.error('Error fetching group plans:', plansError);
      return NextResponse.json({ error: 'Error fetching group plans' }, { status: 500 });
    }
    
    const planIds = plansData.map(plan => plan.id);
    
    // If no plans exist, return empty array
    if (planIds.length === 0) {
      return NextResponse.json({ ideas: [] });
    }
    
    // Fetch all ideas from those plans
    const { data: ideasData, error: ideasError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .select(`
        *,
        votes:${TABLES.GROUP_PLAN_IDEA_VOTES}(
          vote_type,
          user_id
        )
      `)
      .in('plan_id', planIds);
    
    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
      return NextResponse.json({ error: 'Error fetching ideas' }, { status: 500 });
    }
    
    // Process ideas to include vote counts
    const processedIdeas = ideasData.map(idea => {
      // Count votes
      const votesUp = idea.votes?.filter(v => v.vote_type === 'up').length || 0;
      const votesDown = idea.votes?.filter(v => v.vote_type === 'down').length || 0;
      
      // Check if current user has voted
      const userVote = idea.votes?.find(v => v.user_id === user.id)?.vote_type || null;
      
      return {
        ...idea,
        votes_up: votesUp,
        votes_down: votesDown,
        user_vote: userVote,
        votes: undefined, // Remove the votes array
      };
    });
    
    return NextResponse.json({ ideas: processedIdeas });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

/**
 * POST /api/groups/[id]/ideas
 * Create a new idea for a group
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await params before using them
    const params = await context.params;
    const groupId = params.id;
    
    const supabase = await createRouteHandlerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Insert new idea
    const { data: idea, error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .insert({
        group_id: groupId,
        title: body.name,
        description: body.description,
        type: body.type,
        created_by: user.id,
        plan_id: body.plan_id || null,
        // Optional fields
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        position: body.position || null,
        notes: body.notes || null,
        meta: body.meta || null,
      })
      .select(`
        *,
        creator:created_by(
          id,
          email,
          user_metadata
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating idea:', error);
      return NextResponse.json(
        { error: 'Failed to create idea' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ idea });
  } catch (error) {
    console.error('Error in create idea API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Update multiple ideas positions at once (batch update)
 * PATCH /api/groups/[id]/ideas
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user if authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get guest token if not authenticated
    // const guestToken = user ? null : await getGuestToken();
    
    // Require either user auth or guest token
    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || 'Authentication required to update ideas' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const { positions } = body;
    
    if (!Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Invalid positions data format' },
        { status: 400 }
      );
    }
    
    // Start a batch transaction to update all idea positions
    const updates = positions.map(pos => {
      if (!pos.id || !pos.position) return null;
      
      return supabase
        .from(TABLES.GROUP_PLAN_IDEAS)
        .update({
          position: pos.position
        })
        .eq('id', pos.id)
        .eq('group_id', params.id);
    }).filter(Boolean);
    
    // Execute all updates
    await Promise.all(updates);
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updates.length} idea positions` 
    });
  } catch (error) {
    console.error('Error updating idea positions:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 