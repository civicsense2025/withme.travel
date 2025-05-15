import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, USER_TESTING_TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { EventType } from '@/types/research';
import { MILESTONE_EVENT_TYPES } from '@/utils/constants/status';
import { v4 as uuidv4 } from 'uuid';

// Zod schema for an event using the broader EventType
const EventSchema = z.object({
  event_type: z.string().min(1, "Event type is required"),
  event_data: z.record(z.any()).optional(),
  session_id: z.string().optional(),
  user_id: z.string().optional(),
  timestamp: z.string().optional(),
  source: z.string().optional(),
  component: z.string().optional(),
  route: z.string().optional(),
  // These fields are made optional as they're not sent by trackEvent
  type: z.string().min(1, "Event type is required").optional(),
  milestone: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// GET /api/research/events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check admin authorization
    const { data } = await supabase.auth.getSession();
    if (!data?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.session.user.id)
      .single();
      
    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const milestone = searchParams.get('milestone');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Construct query
    let query = supabase
      .from('research_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (milestone) {
      query = query.eq('milestone', milestone);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Execute query
    const { data: events, error: eventsError } = await query;
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error in events GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Create a new research event and check for triggers
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient();
    const data = await request.json();
    
    const { session_id, user_id, event_type, data: eventData = {} } = data;
    
    if (!session_id || !event_type) {
      return NextResponse.json(
        { error: 'Session ID and event type are required' },
        { status: 400 }
      );
    }
    
    // Insert the event
    const { data: event, error } = await supabase
      .from(TABLES.USER_TESTING_EVENTS)
      .insert({
        session_id,
        user_id,
        event_type,
        data: eventData,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Check if this event triggers any milestone surveys
    const { data: triggers, error: triggerError } = await supabase
      .from(TABLES.MILESTONE_TRIGGERS)
      .select(`
        id,
        form_id,
        cooldown_minutes,
        forms ( id, name, type, config )
      `)
      .eq('event_type', event_type)
      .eq('active', true)
      .order('priority', { ascending: false });
    
    if (triggerError) {
      console.error('Error checking for triggers:', triggerError);
    }
    
    // If we have triggers, check if we should show them
    let triggeredFormId = null;
    let milestone = null;
    
    if (triggers && triggers.length > 0) {
      // Get the highest priority trigger that's applicable
      const trigger = triggers[0];
      
      // Check if the user has already seen this form recently
      if (trigger.cooldown_minutes > 0) {
        const cooldownTime = new Date();
        cooldownTime.setMinutes(cooldownTime.getMinutes() - trigger.cooldown_minutes);
        
        const { data: recentResponses, error: responseError } = await supabase
          .from(TABLES.FORM_RESPONSES)
          .select('id')
          .eq('form_id', trigger.form_id)
          .eq('session_id', session_id)
          .gte('submitted_at', cooldownTime.toISOString())
          .limit(1);
        
        if (responseError) {
          console.error('Error checking for recent responses:', responseError);
        }
        
        // If they've already responded recently, don't trigger again
        if (recentResponses && recentResponses.length > 0) {
          // Skip this trigger
          return NextResponse.json(event);
        }
      }
      
      // Set the triggered form ID and milestone
      triggeredFormId = trigger.form_id;
      milestone = eventData.milestone || null;
    }
    
    // Return the event with any triggered form
    return NextResponse.json({
      ...event,
      triggered_form_id: triggeredFormId,
      milestone,
    });
  } catch (error) {
    console.error('Error creating research event:', error);
    return NextResponse.json(
      { error: 'Failed to create research event' },
      { status: 500 }
    );
  }
}
