import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory rate limiting
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 5,   // Increased to 5 responses per minute
  clients: new Map<string, { count: number, resetAt: number }>()
};

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of RATE_LIMIT.clients.entries()) {
    if (data.resetAt <= now) {
      RATE_LIMIT.clients.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Check if request exceeds rate limit
 */
function checkRateLimit(req: Request): boolean {
  // Use forwarded-for header or a hash of other headers as a client identifier
  const clientId = req.headers.get('x-forwarded-for') || 
                   req.headers.get('user-agent') || 
                   'unknown';
  const now = Date.now();
  
  // Get or create rate limit data for this client
  let clientData = RATE_LIMIT.clients.get(clientId);
  if (!clientData || clientData.resetAt <= now) {
    // Reset if window expired
    clientData = { count: 0, resetAt: now + RATE_LIMIT.windowMs };
    RATE_LIMIT.clients.set(clientId, clientData);
  }
  
  // Increment request count
  clientData.count++;
  
  // Check if over limit
  return clientData.count > RATE_LIMIT.maxRequests;
}

/**
 * Validates if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Submit a form response
 */
export async function POST(request: Request) {
  console.log('[research/responses] Processing form response submission');
  
  try {
    // Apply rate limiting for survey submissions
    if (checkRateLimit(request)) {
      console.warn('[research/responses] Rate limit exceeded for client');
      return NextResponse.json(
        { error: 'Too many survey submissions, please try again later' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    const supabase = createRouteHandlerClient();
    const data = await request.json();
    
    const { form_id, session_id, responses, milestone } = data;
    
    console.log('[research/responses] Request data:', { 
      form_id, 
      session_id, 
      responses: Array.isArray(responses) ? `${responses.length} responses` : 'invalid',
      milestone
    });
    
    // Basic validation
    if (!form_id || !session_id || !responses) {
      console.error('[research/responses] Missing required fields:', { form_id, session_id, hasResponses: !!responses });
      return NextResponse.json(
        { error: 'Form ID, session ID, and responses are required' },
        { status: 400 }
      );
    }
    
    // Validate UUID format for session_id
    if (!isValidUUID(session_id)) {
      console.error('[research/responses] Invalid session ID format:', session_id);
      // Generate a random session ID for testing in development
      const testSessionId = process.env.NODE_ENV !== 'production' ? uuidv4() : null;
      if (testSessionId) {
        console.log(`[research/responses] Development mode: Using random session ID: ${testSessionId}`);
        return NextResponse.json({
          error: 'Invalid session ID format. In dev mode, please use this UUID format:', 
          example: testSessionId,
          documentation: "Session IDs must be valid UUIDs" 
        }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Invalid session ID format. Session IDs must be valid UUIDs.' }, { status: 400 });
      }
    }
    
    // Get user ID from session if available
    console.log('[research/responses] Fetching user ID from session:', session_id);
    let user_id = null;
    const { data: session, error: sessionError } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('user_id')
      .eq('id', session_id)
      .single();
    
    if (sessionError) {
      console.warn('[research/responses] Error fetching session:', sessionError.message);
    } else if (session?.user_id) {
      user_id = session.user_id;
      console.log('[research/responses] Found user ID from session:', user_id);
    }
    
    // Log the table schema
    console.log('[research/responses] Using table:', TABLES.FORM_RESPONSES);
    
    // Create the response - using created_at instead of submitted_at
    console.log('[research/responses] Inserting form response');
    const { data: response, error } = await supabase
      .from(TABLES.FORM_RESPONSES)
      .insert({
        form_id,
        session_id,
        user_id,
        responses,
        milestone,
        // Don't specify created_at, let Supabase handle it automatically
      })
      .select()
      .single();
    
    if (error) {
      console.error('[research/responses] Database error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('[research/responses] Response successfully saved:', response.id);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[research/responses] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form response. Please try again.' },
      { status: 500 }
    );
  }
} 