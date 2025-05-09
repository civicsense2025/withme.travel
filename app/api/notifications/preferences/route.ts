import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  
  // If no record exists or window has expired, create new record
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }
  
  // If within window but under limit, increment count
  if (record.count < MAX_REQUESTS_PER_WINDOW) {
    record.count++;
    return true;
  }
  
  // Rate limit exceeded
  return false;
}

// GET user notification preferences
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  
  try {
    console.log('[API] GET /api/notifications/preferences: Starting request');
    
    // Authenticate the user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[API] Notification Preferences - Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!userData?.user) {
      console.error('[API] Notification Preferences - No user found in session');
      return NextResponse.json({ error: 'Unauthorized - No user found' }, { status: 401 });
    }
    
    const userId = userData.user.id;
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`[API] Rate limit exceeded for user ${userId} on GET /api/notifications/preferences`);
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }
    
    console.log(`[API] Notification Preferences - Looking up preferences for user: ${userId}`);
    
    // Get user preferences
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATION_PREFERENCES)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.log('[API] Notification Preferences - Database query error or no preferences found:', error);
      
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') { // No rows returned
        console.log('[API] Notification Preferences - Creating default preferences for user');
        
        const defaultPrefs = {
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          in_app_enabled: true,
          digest_frequency: 'daily',
          muted_types: [],
          quiet_hours: {
            enabled: false,
            start: "22:00",
            end: "07:00",
            timezone: "America/New_York"
          },
          trip_updates: true,
          itinerary_changes: true,
          member_activity: true,
          comments: true,
          votes: true,
          focus_events: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: newPrefs, error: insertError } = await supabase
          .from(TABLES.NOTIFICATION_PREFERENCES)
          .insert(defaultPrefs)
          .select()
          .single();
        
        if (insertError) {
          console.error('[API] Error creating default preferences:', insertError);
          return NextResponse.json(
            { error: 'Failed to create notification preferences' },
            { status: 500 }
          );
        }
        
        console.log('[API] Notification Preferences - Successfully created default preferences');
        return NextResponse.json({ preferences: newPrefs });
      }
      
      console.error('[API] Error fetching notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification preferences' },
        { status: 500 }
      );
    }
    
    console.log('[API] Notification Preferences - Successfully fetched preferences');
    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error('[API] Unexpected error in notification preferences:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Update user notification preferences
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  
  try {
    console.log('[API] PUT /api/notifications/preferences: Starting request');
    
    // Authenticate the user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[API] Notification Preferences PUT - Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!userData?.user) {
      console.error('[API] Notification Preferences PUT - No user found in session');
      return NextResponse.json({ error: 'Unauthorized - No user found' }, { status: 401 });
    }
    
    const userId = userData.user.id;
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`[API] Rate limit exceeded for user ${userId} on PUT /api/notifications/preferences`);
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log(`[API] Notification Preferences PUT - Request body:`, body);
    } catch (error) {
      console.error('[API] Notification Preferences PUT - Invalid request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Check if preferences exist for the user
    const { data: existingPrefs, error: checkError } = await supabase
      .from(TABLES.NOTIFICATION_PREFERENCES)
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code === 'PGRST116') {
      // Create preferences if they don't exist
      console.log('[API] Notification Preferences PUT - Creating preferences since they don\'t exist');
      const defaultPrefs = {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        digest_frequency: 'daily',
        muted_types: [],
        quiet_hours: {
          enabled: false,
          start: "22:00",
          end: "07:00",
          timezone: "America/New_York"
        },
        ...body.preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newPrefs, error: insertError } = await supabase
        .from(TABLES.NOTIFICATION_PREFERENCES)
        .insert(defaultPrefs)
        .select()
        .single();
      
      if (insertError) {
        console.error('[API] Error creating notification preferences:', insertError);
        return NextResponse.json(
          { error: 'Failed to create notification preferences' },
          { status: 500 }
        );
      }
      
      console.log('[API] Notification Preferences PUT - Successfully created preferences');
      return NextResponse.json({ preferences: newPrefs });
    } else if (checkError) {
      console.error('[API] Error checking for existing preferences:', checkError);
      return NextResponse.json(
        { error: 'Failed to verify existing notification preferences' },
        { status: 500 }
      );
    }
    
    console.log('[API] Notification Preferences PUT - Updating existing preferences');
    // Update preferences
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATION_PREFERENCES)
      .update({ 
        ...(body.preferences || {}),
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[API] Error updating notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      );
    }
    
    console.log('[API] Notification Preferences PUT - Successfully updated preferences');
    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error('[API] Unexpected error updating notification preferences:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 