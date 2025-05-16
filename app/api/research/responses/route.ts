import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// Simple in-memory rate limiting
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 2,   // 2 response submissions per minute
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
 * Submit a form response
 */
export async function POST(request: Request) {
  try {
    // Apply rate limiting for survey submissions
    if (checkRateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many survey submissions, please try again later' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    const supabase = createRouteHandlerClient();
    const data = await request.json();
    
    const { form_id, session_id, responses, milestone } = data;
    
    if (!form_id || !session_id || !responses) {
      return NextResponse.json(
        { error: 'Form ID, session ID, and responses are required' },
        { status: 400 }
      );
    }
    
    // Get user ID from session if available
    let user_id = null;
    const { data: session, error: sessionError } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('user_id')
      .eq('id', session_id)
      .single();
    
    if (!sessionError && session?.user_id) {
      user_id = session.user_id;
    }
    
    // Create the response
    const { data: response, error } = await supabase
      .from(TABLES.FORM_RESPONSES)
      .insert({
        form_id,
        session_id,
        user_id,
        responses,
        milestone,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json(
      { error: 'Failed to submit form response' },
      { status: 500 }
    );
  }
} 