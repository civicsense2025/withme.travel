import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { EventType } from '@/types/research';

// Zod schema for an event using the broader EventType
const EventSchema = z.object({
  event_type: z.custom<EventType>(),
  event_data: z.record(z.any()).optional(),
  session_id: z.string().optional(),
  user_id: z.string().optional(),
  timestamp: z.string().optional(),
  source: z.string().optional(),
  component: z.string().optional(),
  route: z.string().optional(),
});

// GET /api/research/events
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const searchParams = request.nextUrl.searchParams;
  
  try {
    // Get query parameters
    const eventType = searchParams.get('event_type');
    const userId = searchParams.get('user_id');
    const sessionId = searchParams.get('session_id');
    const source = searchParams.get('source');
    const component = searchParams.get('component');
    const route = searchParams.get('route');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '0');
    
    // Start building query
    let query = supabase
      .from(TABLES.USER_TESTING_EVENTS)
      .select('*');
    
    // Apply filters
    if (eventType) query = query.eq('event_type', eventType);
    if (userId) query = query.eq('user_id', userId);
    if (sessionId) query = query.eq('session_id', sessionId);
    if (source) query = query.eq('source', source);
    if (component) query = query.eq('component', component);
    if (route) query = query.eq('route', route);
    if (from) query = query.gte('timestamp', from);
    if (to) query = query.lte('timestamp', to);
    
    // Apply pagination
    query = query.order('timestamp', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from(TABLES.USER_TESTING_EVENTS)
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting events:', countError);
    }
    
    return NextResponse.json({ 
      events: data,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: totalCount ? Math.ceil(totalCount / limit) : 0
      }
    });
  } catch (error) {
    console.error('Unexpected error in events GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/research/events
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const body = await request.json();
  
  try {
    // Validate event
    const result = EventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid event', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    // Default timestamp if not provided
    if (!body.timestamp) {
      body.timestamp = new Date().toISOString();
    }
    
    // Insert event
    const { data, error } = await supabase
      .from(TABLES.USER_TESTING_EVENTS)
      .insert([body])
      .select()
      .single();
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // Check for milestone triggers in one combined query
    const { data: triggerData, error: triggerError } = await supabase
      .from(TABLES.MILESTONE_TRIGGERS)
      .select('*, form:forms(*)')
      .eq('event_type', body.event_type)
      .eq('active', true)
      .order('priority', { ascending: false })
      .limit(5);
      
    if (triggerError) {
      console.error('Error checking for triggers:', triggerError);
      // Continue without failing the request
    }
    
    // Process matching triggers
    const triggers = [];
    if (triggerData && triggerData.length > 0) {
      for (const trigger of triggerData) {
        // Check if any additional conditions are met
        let conditionsMet = true;
        
        // Filter by value conditions (if any specified in the trigger)
        if (trigger.filter_key && trigger.filter_value && body.event_data) {
          // Check if the event data contains the required key/value pair
          if (body.event_data[trigger.filter_key] !== trigger.filter_value) {
            conditionsMet = false;
          }
        }
        
        if (conditionsMet) {
          triggers.push({
            id: trigger.id,
            formId: trigger.form_id,
            form: trigger.form,
            priority: trigger.priority
          });
        }
      }
    }
    
    // Return the event data with available triggers
    return NextResponse.json({ 
      event: data,
      triggers: triggers.length > 0 ? triggers : undefined
    });
  } catch (error) {
    console.error('Unexpected error in events POST endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
