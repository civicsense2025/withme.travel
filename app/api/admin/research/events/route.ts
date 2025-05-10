import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { RESEARCH_EVENTS } from '@/utils/research';
import { rateLimit } from '@/lib/rate-limit';

// Cache responses for 5 minutes as event types don't change often
export const revalidate = 300;

/**
 * GET /api/admin/research/events
 * List all tracked event types for a given study
 * This helps with populating dropdowns in the admin panel
 */
export async function GET(request: NextRequest) {
  try {
    // No rate limiting for admin panel endpoints
    
    const supabase = await createRouteHandlerClient();
    
    // Check admin permissions
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get study_id from query parameter (optional)
    const url = new URL(request.url);
    const studyId = url.searchParams.get('studyId') || url.searchParams.get('study_id');
    
    // Prepare common event types that will always be included
    const commonEventTypes = [
      'trip_created',
      'itinerary_item_added',
      'place_saved',
      'invite_sent',
      'member_joined',
      'comment_added',
      'vote_cast',
      'budget_updated',
      'login_completed',
      'signup_completed',
      'user_onboarding_complete',
      // Add the research events from our constants
      RESEARCH_EVENTS.COMPLETE_ONBOARDING,
      RESEARCH_EVENTS.ITINERARY_MILESTONE_3_ITEMS,
      RESEARCH_EVENTS.GROUP_FORMATION_COMPLETE,
      RESEARCH_EVENTS.VOTE_PROCESS_USED,
      RESEARCH_EVENTS.TRIP_FROM_TEMPLATE_CREATED
    ];
    
    // Try to fetch additional events from the database
    try {
      let query = supabase
        .from(TABLES.RESEARCH_EVENTS as any)
        .select('event_name')
        .is('event_name', 'not.null');
      
      // If study_id is provided, filter by that study
      if (studyId) {
        query = query.eq('study_id', studyId);
      }
      
      const { data: eventData, error } = await query;
      
      if (!error && eventData) {
        // Extract unique event types if we have data
        const databaseEvents = [...new Set(eventData.map(event => event.event_name))];
        
        // Combine actual events and common events, removing duplicates
        const allEventTypes = [
          ...new Set([...databaseEvents, ...commonEventTypes])
        ].sort();
        
        return NextResponse.json(allEventTypes);
      }
    } catch (dbError) {
      console.error('Error fetching research events:', dbError);
      // Fall through to returning just common events
    }
    
    // Return just common events if we couldn't get database events
    return NextResponse.json([...new Set(commonEventTypes)].sort());
  } catch (error) {
    console.error('Unexpected error in events API:', error);
    // Return an empty array instead of an error to prevent UI breakage
    return NextResponse.json([]);
  }
} 