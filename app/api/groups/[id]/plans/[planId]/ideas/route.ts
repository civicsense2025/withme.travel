import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { GroupIdea, ColumnId, IdeaPosition } from '../../../../../../groups/[id]/plans/[slug]/store/idea-store';
import { cookies } from 'next/headers';
import { getGuestToken } from '@/utils/guest';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/groups/[id]/plans/[planId]/ideas
 * Get all ideas in a plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get guest token if no authenticated user - guestToken is synchronous now
    const guestToken = !user ? getGuestToken() : null;
    
    if (!user && !guestToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For authenticated users, check membership
    if (user) {
      // Check if user is a member of the group
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this group' },
          { status: 403 }
        );
      }
    }
    
    // Check if plan exists and belongs to this group
    const { data: plan, error: planError } = await supabase
      .from('group_idea_plans')
      .select('*')
      .eq('id', params.planId)
      .eq('group_id', params.id)
      .single();
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or does not belong to this group' },
        { status: 404 }
      );
    }
    
    // Get ideas for this plan
    const { data: ideas, error: ideasError } = await supabase
      .from('group_ideas')
      .select(`
        *,
        creator:created_by(
          id,
          email,
          user_metadata
        ),
        votes:group_idea_votes(
          id,
          user_id,
          vote_type
        )
      `)
      .eq('group_id', params.id)
      .eq('plan_id', params.planId)
      .order('created_at', { ascending: false });
    
    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ ideas: ideas || [] });
  } catch (error) {
    console.error('Error in get plan ideas API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/plans/[planId]/ideas
 * Create a new idea in a plan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    console.log(`[Ideas API] Starting idea creation for plan ${params.planId} in group ${params.id}`);
    const supabase = await createRouteHandlerClient();
    
    // First try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log(`[Ideas API] Auth error: ${JSON.stringify(authError)}`);
    }
    
    // Get guest token - guestToken is synchronous now
    const guestToken = getGuestToken();
    console.log(`[Ideas API] Auth status: user=${!!user}, guestToken=${!!guestToken}`);
    
    // Must have either an authenticated user or a guest token
    if (!user && !guestToken) {
      console.log(`[Ideas API] Authentication required - no user or guest token`);
      return NextResponse.json(
        { error: 'Authentication required', details: 'No user session or guest token found' },
        { status: 401 }
      );
    }
    
    // Get idea data from request body
    const ideaData = await request.json();
    console.log(`[Ideas API] Received idea data: ${JSON.stringify({
      title: ideaData.title,
      type: ideaData.type,
      plan_id: params.planId
    })}`);
    
    // Basic validation
    if (!ideaData.title || !ideaData.type) {
      console.log(`[Ideas API] Missing required fields`);
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Extract data from params
    const groupId = params.id;
    const planId = params.planId;
    
    // Verify plan exists and belongs to this group
    const { data: plan, error: planError } = await supabase
      .from('group_idea_plans')
      .select('*')
      .eq('id', planId)
      .eq('group_id', groupId)
      .single();
    
    if (planError || !plan) {
      console.log(`[Ideas API] Plan not found or doesn't belong to group: ${planError?.message}`);
      return NextResponse.json(
        { error: 'Plan not found', details: 'The specified plan does not exist or does not belong to this group' },
        { status: 404 }
      );
    }
    
    // Prepare the idea for insertion
    const newIdea = {
      id: uuidv4(),
      title: ideaData.title,
      description: ideaData.description || null,
      type: ideaData.type,
      group_id: groupId,
      plan_id: planId,
      position: ideaData.position || { columnId: ideaData.type, index: 0 },
      created_by: user ? user.id : null,
      guest_token: !user ? guestToken : null,
      votes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log(`[Ideas API] Inserting new idea with ${user ? 'user ID' : 'guest token'}: ${user?.id || guestToken}`);
    
    // Insert the idea
    const { data: idea, error } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .insert(newIdea)
      .select('*')
      .single();
    
    if (error) {
      console.error(`[Ideas API] Error creating idea: ${error.message}`, error);
      return NextResponse.json(
        { 
          error: 'Failed to create idea', 
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    console.log(`[Ideas API] Successfully created idea with ID: ${idea.id}`);
    
    // Return the created idea
    return NextResponse.json({ idea });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Ideas API] Unhandled error in create idea: ${errorMessage}`, error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
      },
      { status: 500 }
    );
  }
} 