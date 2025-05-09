import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';
import { createHash } from 'crypto';

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per user

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

// Clean up the rate limit map periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    if (now - record.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

// GET user notification preferences
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  
  try {
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
      
      const response = NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
      
      response.headers.set('Retry-After', '60');
      return response;
    }
    
    // Get user preferences
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATION_PREFERENCES)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') { // No rows returned
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
        
        // Generate ETag for the new preferences
        const prefsHash = createHash('md5').update(JSON.stringify(newPrefs)).digest('hex');
        const etag = `"preferences-${userId}-${prefsHash}"`;
        
        const response = NextResponse.json({ preferences: newPrefs });
        response.headers.set('ETag', etag);
        response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
        
        return response;
      }
      
      console.error('[API] Error fetching notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification preferences' },
        { status: 500 }
      );
    }
    
    // Generate ETag for the preferences
    const prefsHash = createHash('md5').update(JSON.stringify(data)).digest('hex');
    const etag = `"preferences-${userId}-${prefsHash}"`;
    
    // Check if client already has this version
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304, // Not Modified
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=300' // 5 minutes
        }
      });
    }
    
    // Return preferences with caching headers
    const response = NextResponse.json({ preferences: data });
    response.headers.set('ETag', etag);
    response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    
    return response;
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
      
      return NextResponse.json({ preferences: newPrefs, created: true });
    } else if (checkError) {
      console.error('[API] Error checking for existing preferences:', checkError);
      return NextResponse.json(
        { error: 'Failed to verify existing notification preferences' },
        { status: 500 }
      );
    }
    
    // Update preferences with a timestamp
    const updates = {
      ...body.preferences,
      updated_at: new Date().toISOString()
    };
    
    // Update preferences
    const { data, error } = await supabase
      .from(TABLES.NOTIFICATION_PREFERENCES)
      .update(updates)
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
    
    // Return updated preferences with a new ETag
    const prefsHash = createHash('md5').update(JSON.stringify(data)).digest('hex');
    const etag = `"preferences-${userId}-${prefsHash}"`;
    
    const response = NextResponse.json({ preferences: data, updated: true });
    response.headers.set('ETag', etag);
    response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    
    return response;
  } catch (err) {
    console.error('[API] Unexpected error in PUT notification preferences:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 